import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Between,
  MoreThanOrEqual,
  Not,
  In,
} from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingAddOn } from './entities/booking-addon.entity';
import { generateBookingNumber } from '../utils/id-generator.util';
import { NotificationsService } from '../notification/notifications.service';
import { NotificationType } from '../notification/entities/notification.entity';

// Adding interface for query parameters
interface BookingQueryParams {
  limit?: number;
  page?: number;
  user_id?: string;
  service_id?: string;
  status?: BookingStatus;
  date_from?: string | Date;
  date_to?: string | Date;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  upcoming?: boolean;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,

    @InjectRepository(BookingAddOn)
    private readonly bookingAddOnsRepository: Repository<BookingAddOn>,

    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    try {
      this.logger.log(
        `Creating booking for user ${userId} and service ${createBookingDto.service_id}`,
      );

      // Check if service time slot is available
      const isAvailable = await this.checkAvailability(
        createBookingDto.service_id,
        createBookingDto.service_date,
        createBookingDto.service_time,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          'The selected time slot is not available',
        );
      }

      // Create booking
      const booking = this.bookingsRepository.create({
        ...createBookingDto,
        user_id: userId, // Override with authenticated user ID
        booking_number: generateBookingNumber(),
        status: BookingStatus.PENDING,
      });

      // Save booking
      const savedBooking = await this.bookingsRepository.save(booking);
      this.logger.log(`Booking created with ID: ${savedBooking.id}`);

      // Process add-ons if any
      if (
        createBookingDto.booking_addons &&
        createBookingDto.booking_addons.length > 0
      ) {
        const addOns = createBookingDto.booking_addons.map((addon) => {
          return this.bookingAddOnsRepository.create({
            booking_id: savedBooking.id,
            addon_id: addon.addon_id,
            price: addon.price,
          });
        });

        await this.bookingAddOnsRepository.save(addOns);
      }

      // Load the service to get provider information
      const bookingWithRelations = await this.bookingsRepository.findOne({
        where: { id: savedBooking.id },
        relations: ['user', 'service'],
      });

      // Send notification to service provider
      if (
        bookingWithRelations &&
        bookingWithRelations.service &&
        bookingWithRelations.service.business_id
      ) {
        try {
          this.logger.log(
            `Sending notification to provider ${bookingWithRelations.service.business_id} for booking ${savedBooking.id}`,
          );

          await this.notificationsService.create({
            user_id: bookingWithRelations.service.business_id,
            type: NotificationType.BOOKING_CONFIRMATION,
            title: 'New Booking Request',
            message: `You have a new booking request for ${bookingWithRelations.service.name} on ${createBookingDto.service_date} at ${createBookingDto.service_time}`,
            data: {
              booking_id: savedBooking.id,
              booking_number: savedBooking.booking_number,
              service_date: createBookingDto.service_date,
              service_time: createBookingDto.service_time,
              service_name: bookingWithRelations.service.name,
            },
          });

          // Emit event for other systems to react to
          this.eventEmitter.emit('booking.created', {
            bookingId: savedBooking.id,
            providerId: bookingWithRelations.service.business_id,
            customerId: userId,
          });

          this.logger.log('Notification sent successfully');
        } catch (notificationError: unknown) {
          // Log but don't fail the booking creation
          const errorMessage =
            notificationError instanceof Error
              ? notificationError.message
              : 'Unknown notification error';
          this.logger.error(`Failed to send notification: ${errorMessage}`);
        }
      }

      // Return saved booking
      return savedBooking;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create booking: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to create booking');
    }
  }

  async findAll(query?: BookingQueryParams) {
    try {
      const where: FindOptionsWhere<Booking> = {};
      const take = query?.limit ? +query.limit : 10;
      const skip = query?.page ? (+query.page - 1) * take : 0;

      // Apply filters
      if (query?.user_id) {
        where.user_id = query.user_id;
      }

      if (query?.service_id) {
        where.service_id = query.service_id;
      }

      if (query?.status) {
        where.status = query.status;
      }

      // Date range filter
      if (query?.date_from || query?.date_to) {
        where.service_date = Between(
          query.date_from ? new Date(query.date_from) : new Date(),
          query.date_to
            ? new Date(query.date_to)
            : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        );
      }

      const [bookings, total] = await this.bookingsRepository.findAndCount({
        where,
        take,
        skip,
        relations: ['user', 'service', 'booking_addons', 'payment', 'review'],
        order: {
          [query?.sort_by || 'created_at']: query?.sort_order || 'DESC',
        },
      });

      return {
        data: bookings,
        meta: {
          total,
          page: query?.page ? +query.page : 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch bookings: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to fetch bookings');
    }
  }

  async findByUserId(userId: string) {
    try {
      const bookings = await this.bookingsRepository.find({
        where: { user_id: userId },
        relations: ['service', 'booking_addons', 'payment', 'review'],
        order: { created_at: 'DESC' },
      });

      return bookings;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch user bookings: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to fetch user bookings');
    }
  }

  async findOne(id: number | string, userId: string) {
    try {
      const booking = await this.bookingsRepository.findOne({
        where: { id: id.toString() },
        relations: ['user', 'service', 'booking_addons', 'payment', 'review'],
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      // Only allow access to one's own bookings unless they're a service provider
      if (
        booking.user_id !== userId &&
        booking.service?.business_id !== userId
      ) {
        throw new ForbiddenException(
          'You do not have permission to access this booking',
        );
      }

      return booking;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch booking details');
    }
  }

  async update(
    id: number | string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
  ) {
    try {
      this.logger.log(`Updating booking ${id} by user ${userId}`);

      // Find booking first
      const booking = await this.findOne(id, userId);

      // Check if booking can be updated
      if (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.COMPLETED
      ) {
        throw new BadRequestException(
          `Cannot update a booking with status: ${booking.status}`,
        );
      }

      // If updating the time, check availability
      if (updateBookingDto.service_date || updateBookingDto.service_time) {
        const isAvailable = await this.checkAvailability(
          booking.service_id,
          updateBookingDto.service_date || booking.service_date.toISOString(),
          updateBookingDto.service_time || booking.service_time,
          booking.id, // Exclude current booking from availability check
        );

        if (!isAvailable) {
          throw new BadRequestException(
            'The selected time slot is not available',
          );
        }
      }

      // Keep track of old status for notification purposes
      const oldStatus = booking.status;

      // Update booking
      const updatedBooking = await this.bookingsRepository.save({
        ...booking,
        ...updateBookingDto,
        user_id: booking.user_id, // Prevent changing the user
        service_id: booking.service_id, // Prevent changing the service
      });

      // Send notifications if status has changed
      if (updateBookingDto.status && updateBookingDto.status !== oldStatus) {
        try {
          // Load the booking with relations to get all the info we need
          const bookingWithRelations = await this.bookingsRepository.findOne({
            where: { id: updatedBooking.id },
            relations: ['user', 'service'],
          });

          if (bookingWithRelations) {
            // Notify user about status change
            if (bookingWithRelations.user_id) {
              this.logger.log(
                `Sending status update notification to user ${bookingWithRelations.user_id}`,
              );

              await this.notificationsService.create({
                user_id: bookingWithRelations.user_id,
                type: NotificationType.SYSTEM,
                title: `Booking ${this.getStatusText(updateBookingDto.status)}`,
                message: `Your booking for ${bookingWithRelations.service?.name || 'service'} on ${this.formatDateForMessage(bookingWithRelations.service_date)} has been ${this.getStatusText(updateBookingDto.status).toLowerCase()}.`,
                data: {
                  booking_id: updatedBooking.id,
                  booking_number: updatedBooking.booking_number,
                  new_status: updateBookingDto.status,
                  previous_status: oldStatus,
                  service_date: bookingWithRelations.service_date,
                  service_time: bookingWithRelations.service_time,
                },
              });
            }

            // Notify service provider if user updated
            if (
              bookingWithRelations.service?.business_id &&
              booking.user_id === userId
            ) {
              this.logger.log(
                `Sending update notification to provider ${bookingWithRelations.service.business_id}`,
              );

              await this.notificationsService.create({
                user_id: bookingWithRelations.service.business_id,
                type: NotificationType.SYSTEM,
                title: 'Booking Updated',
                message: `A booking for ${bookingWithRelations.service.name} on ${this.formatDateForMessage(bookingWithRelations.service_date)} has been updated.`,
                data: {
                  booking_id: updatedBooking.id,
                  booking_number: updatedBooking.booking_number,
                  updated_by: 'customer',
                  service_date: bookingWithRelations.service_date,
                  service_time: bookingWithRelations.service_time,
                },
              });
            }
          }
        } catch (notificationError: unknown) {
          // Log but don't fail the update process
          const errorMessage =
            notificationError instanceof Error
              ? notificationError.message
              : 'Unknown notification error';
          this.logger.error(`Failed to send notification: ${errorMessage}`);
        }
      }

      return updatedBooking;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update booking: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to update booking');
    }
  }

  // Helper to format dates for messages
  private formatDateForMessage(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper to get user-friendly status text
  private getStatusText(status: BookingStatus): string {
    const statusMap = {
      [BookingStatus.PENDING]: 'Pending',
      [BookingStatus.CONFIRMED]: 'Confirmed',
      [BookingStatus.IN_PROGRESS]: 'In Progress',
      [BookingStatus.COMPLETED]: 'Completed',
      [BookingStatus.CANCELLED]: 'Cancelled',
      [BookingStatus.NO_SHOW]: 'No Show',
    };
    return statusMap[status] || 'Updated';
  }

  async cancel(id: number | string, userId: string, reason?: string) {
    try {
      this.logger.log(`Cancelling booking ${id} by user ${userId}`);

      // Find booking first
      const booking = await this.findOne(id, userId);

      // Check if booking can be cancelled
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking is already cancelled');
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed booking');
      }

      // Update booking status to cancelled
      const cancelledBooking = await this.bookingsRepository.save({
        ...booking,
        status: BookingStatus.CANCELLED,
        special_instructions: reason
          ? `${booking.special_instructions || ''}\n\nCancellation reason: ${reason}`
          : booking.special_instructions,
      });

      // Send cancellation notifications
      try {
        // Load the booking with relations
        const bookingWithRelations = await this.bookingsRepository.findOne({
          where: { id: cancelledBooking.id },
          relations: ['user', 'service'],
        });

        if (bookingWithRelations) {
          // If cancelled by service provider, notify customer
          if (bookingWithRelations.service?.business_id === userId) {
            this.logger.log(
              `Sending cancellation notification to user ${bookingWithRelations.user_id}`,
            );

            await this.notificationsService.create({
              user_id: bookingWithRelations.user_id,
              type: NotificationType.BOOKING_CANCELLED,
              title: 'Booking Cancelled by Provider',
              message: `Your booking for ${bookingWithRelations.service?.name || 'service'} on ${this.formatDateForMessage(bookingWithRelations.service_date)} has been cancelled by the provider.${reason ? ` Reason: ${reason}` : ''}`,
              data: {
                booking_id: cancelledBooking.id,
                booking_number: cancelledBooking.booking_number,
                cancelled_by: 'provider',
                reason: reason || 'Not specified',
                service_date: bookingWithRelations.service_date,
                service_time: bookingWithRelations.service_time,
              },
            });
          }
          // If cancelled by customer, notify provider
          else if (
            bookingWithRelations.user_id === userId &&
            bookingWithRelations.service?.business_id
          ) {
            this.logger.log(
              `Sending cancellation notification to provider ${bookingWithRelations.service.business_id}`,
            );

            await this.notificationsService.create({
              user_id: bookingWithRelations.service.business_id,
              type: NotificationType.BOOKING_CANCELLED,
              title: 'Booking Cancelled by Customer',
              message: `A booking for ${bookingWithRelations.service.name} on ${this.formatDateForMessage(bookingWithRelations.service_date)} has been cancelled by the customer.${reason ? ` Reason: ${reason}` : ''}`,
              data: {
                booking_id: cancelledBooking.id,
                booking_number: cancelledBooking.booking_number,
                cancelled_by: 'customer',
                reason: reason || 'Not specified',
                service_date: bookingWithRelations.service_date,
                service_time: bookingWithRelations.service_time,
              },
            });
          }
        }
      } catch (notificationError: unknown) {
        // Log but don't fail the cancellation process
        const errorMessage =
          notificationError instanceof Error
            ? notificationError.message
            : 'Unknown notification error';
        this.logger.error(
          `Failed to send cancellation notification: ${errorMessage}`,
        );
      }

      return cancelledBooking;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to cancel booking: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to cancel booking');
    }
  }

  async remove(id: number | string, userId: string) {
    try {
      // Find booking first
      const booking = await this.findOne(id, userId);

      // Only allow deletion of pending or cancelled bookings
      if (
        ![BookingStatus.PENDING, BookingStatus.CANCELLED].includes(
          booking.status,
        )
      ) {
        throw new BadRequestException(
          'Only pending or cancelled bookings can be deleted',
        );
      }

      // Delete booking add-ons first
      await this.bookingAddOnsRepository.delete({ booking_id: booking.id });

      // Delete booking
      await this.bookingsRepository.remove(booking);

      return {
        id: booking.id,
        message: 'Booking deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete booking');
    }
  }

  // Helper method to check service availability
  async checkAvailability(
    serviceId: string,
    date: string,
    time: string,
    excludeBookingId?: string,
  ): Promise<boolean> {
    try {
      // Calculate time range (assume each service takes 1 hour)
      const bookingTime = new Date(`${date}T${time}`);
      const bookingEndTime = new Date(bookingTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const where: FindOptionsWhere<Booking> = {
        service_id: serviceId,
        service_date: new Date(date),
        status: In([
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.IN_PROGRESS,
        ]),
      };

      // Exclude current booking if updating
      if (excludeBookingId) {
        where.id = Not(excludeBookingId);
      }

      // Find any overlapping bookings
      const overlappingBookings = await this.bookingsRepository.find({
        where,
      });

      // Check if any existing booking overlaps with the requested time
      for (const booking of overlappingBookings) {
        const existingTime = new Date(
          `${booking.service_date.toISOString().split('T')[0]}T${booking.service_time}`,
        );
        const existingEndTime = new Date(
          existingTime.getTime() + 60 * 60 * 1000,
        ); // 1 hour later

        // Check if times overlap
        if (
          (bookingTime >= existingTime && bookingTime < existingEndTime) ||
          (bookingEndTime > existingTime &&
            bookingEndTime <= existingEndTime) ||
          (bookingTime <= existingTime && bookingEndTime >= existingEndTime)
        ) {
          return false; // Time slot not available
        }
      }

      return true; // Time slot available
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to check availability: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to check availability');
    }
  }

  // Provider-specific booking methods
  async getProviderBookings(providerId: string, query?: BookingQueryParams) {
    try {
      // Query services owned by provider
      const where: FindOptionsWhere<Booking> = {};
      const take = query?.limit ? +query.limit : 10;
      const skip = query?.page ? (+query.page - 1) * take : 0;

      // Apply filters
      if (query?.status) {
        where.status = query.status;
      }

      // Date range filter
      if (query?.date_from || query?.date_to) {
        where.service_date = Between(
          query.date_from ? new Date(query.date_from) : new Date(),
          query.date_to
            ? new Date(query.date_to)
            : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        );
      }

      // Future bookings filter
      if (query?.upcoming) {
        where.service_date = MoreThanOrEqual(new Date());
      }

      const [bookings, total] = await this.bookingsRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('booking.user', 'user')
        .leftJoinAndSelect('booking.booking_addons', 'addons')
        .leftJoinAndSelect('booking.payment', 'payment')
        .where('service.provider_id = :providerId', { providerId })
        .andWhere(where)
        .orderBy('booking.service_date', 'ASC')
        .addOrderBy('booking.service_time', 'ASC')
        .take(take)
        .skip(skip)
        .getManyAndCount();

      return {
        data: bookings,
        meta: {
          total,
          page: query?.page ? +query.page : 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch provider bookings: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Failed to fetch provider bookings',
      );
    }
  }
}
