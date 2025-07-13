import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { ServiceStatus } from '../services/enums/service.enums';

export interface ServiceProviderDashboardStats {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  rating: number;
  recentBookings: Booking[];
}

export interface BookingNotification {
  id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  bookingDate: Date;
  status: string;
  message: string;
}

@Injectable()
export class ServiceProviderDashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  // Get dashboard statistics for service provider
  async getDashboardStats(
    providerId: string,
  ): Promise<ServiceProviderDashboardStats> {
    const provider = await this.userRepository.findOne({
      where: { id: providerId, role: Role.SERVICE_PROVIDER },
    });

    if (!provider) {
      throw new NotFoundException('Service provider not found');
    }

    // Get services count
    const totalServices = await this.serviceRepository.count({
      where: { provider_id: providerId },
    });

    const activeServices = await this.serviceRepository.count({
      where: { provider_id: providerId, status: ServiceStatus.ACTIVE },
    });

    // Get bookings statistics
    const totalBookings = await this.bookingRepository.count({
      where: { service: { provider_id: providerId } },
    });

    const pendingBookings = await this.bookingRepository.count({
      where: {
        service: { provider_id: providerId },
        status: BookingStatus.PENDING,
      },
    });

    const completedBookings = await this.bookingRepository.count({
      where: {
        service: { provider_id: providerId },
        status: BookingStatus.COMPLETED,
      },
    });

    // Calculate total earnings from completed bookings
    const earningsResult = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.service', 'service')
      .where('service.provider_id = :providerId', { providerId })
      .andWhere('booking.status = :status', { status: BookingStatus.COMPLETED })
      .select('SUM(booking.total_amount)', 'total')
      .getRawOne();

    const totalEarnings = parseFloat(earningsResult?.total || '0');

    // Get recent bookings
    const recentBookings = await this.bookingRepository.find({
      where: { service: { provider_id: providerId } },
      order: { created_at: 'DESC' },
      take: 10,
      relations: ['user', 'service'],
    });

    return {
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalEarnings,
      rating: provider.rating,
      recentBookings,
    };
  }

  // Get pending booking notifications for service provider
  async getBookingNotifications(
    providerId: string,
  ): Promise<BookingNotification[]> {
    const provider = await this.userRepository.findOne({
      where: { id: providerId, role: Role.SERVICE_PROVIDER },
    });

    if (!provider) {
      throw new NotFoundException('Service provider not found');
    }

    const pendingBookings = await this.bookingRepository.find({
      where: {
        service: { provider_id: providerId },
        status: BookingStatus.PENDING,
      },
      order: { created_at: 'DESC' },
      relations: ['user', 'service'],
    });

    return pendingBookings.map((booking) => ({
      id: `notif_${booking.id}`,
      bookingId: booking.id,
      customerName: `${booking.user.first_name} ${booking.user.last_name}`,
      serviceName: booking.service.name,
      bookingDate: booking.service_date,
      status: booking.status,
      message: `New booking request for ${booking.service.name}`,
    }));
  }

  // Accept a booking
  async acceptBooking(providerId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        service: { provider_id: providerId },
      },
      relations: ['service', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException('Only pending bookings can be accepted');
    }

    booking.status = BookingStatus.CONFIRMED;
    return await this.bookingRepository.save(booking);
  }

  // Deny a booking
  async denyBooking(
    providerId: string,
    bookingId: string,
    reason?: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        service: { provider_id: providerId },
      },
      relations: ['service', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException('Only pending bookings can be denied');
    }

    booking.status = BookingStatus.CANCELLED;
    if (reason) {
      booking.special_instructions = `Cancelled by provider: ${reason}`;
    }

    return await this.bookingRepository.save(booking);
  }

  // Start service (mark booking as in progress)
  async startService(providerId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        service: { provider_id: providerId },
      },
      relations: ['service', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new ForbiddenException('Only confirmed bookings can be started');
    }

    booking.status = BookingStatus.IN_PROGRESS;
    return await this.bookingRepository.save(booking);
  }

  // Complete service (mark booking as completed)
  async completeService(
    providerId: string,
    bookingId: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        service: { provider_id: providerId },
      },
      relations: ['service', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new ForbiddenException(
        'Only in-progress bookings can be completed',
      );
    }

    booking.status = BookingStatus.COMPLETED;
    return await this.bookingRepository.save(booking);
  }

  // Get all bookings for service provider with filtering
  async getProviderBookings(
    providerId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.user', 'user')
      .where('service.provider_id = :providerId', { providerId });

    if (filters?.status) {
      queryBuilder.andWhere('booking.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('booking.service_date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('booking.service_date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('booking.created_at', 'DESC').skip(skip).take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update service provider location (for real-time tracking)
  async updateLocation(
    providerId: string,
    latitude: number,
    longitude: number,
  ): Promise<User> {
    const provider = await this.userRepository.findOne({
      where: { id: providerId, role: Role.SERVICE_PROVIDER },
    });

    if (!provider) {
      throw new NotFoundException('Service provider not found');
    }

    provider.latitude = latitude;
    provider.longitude = longitude;

    return await this.userRepository.save(provider);
  }
}
