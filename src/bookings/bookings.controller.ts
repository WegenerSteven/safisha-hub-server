import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUserId } from '../auth/decorators/get-current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { BookingStatus } from './entities/booking.entity';
import { Request } from 'express';
import { Req } from '@nestjs/common';

interface AuthUser {
  userId?: string;
  id?: string;
  sub?: string;
}
@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AtGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Booking created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid booking data or time slot unavailable',
  })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @GetCurrentUserId() userId: string,
  ) {
    // Set user_id from the authenticated user
    createBookingDto.user_id = userId;
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get bookings for the current authenticated user' })
  getMyBookings(@GetCurrentUserId() userId: string) {
    return this.bookingsService.findByUserId(userId);
  }

  @Get('provider')
  @ApiOperation({
    summary: 'Get bookings for services provided by the current user',
  })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  getProviderBookings(
    @GetCurrentUserId() providerId: string,
    @Query() query: any,
  ) {
    return this.bookingsService.getProviderBookings(providerId, query);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with filters' })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'service_id', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sort_by', required: false })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['ASC', 'DESC'] })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SERVICE_PROVIDER)
  findAll(@Query() query: any) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.bookingsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({ type: UpdateBookingDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data or status',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.bookingsService.update(id, updateBookingDto, userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SERVICE_PROVIDER)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
    @Req() req: Request,
  ) {
    // Use whichever property is available for user id
    const userId =
      (req.user as AuthUser)?.userId ||
      (req.user as AuthUser)?.id ||
      (req.user as AuthUser)?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.bookingsService.updateStatus(id, body.status, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({
    schema: {
      properties: { reason: { type: 'string', example: 'Schedule conflict' } },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking cancelled successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Booking cannot be cancelled',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @GetCurrentUserId() userId: string,
  ) {
    return this.bookingsService.cancel(id, userId, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Booking cannot be deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.bookingsService.remove(id, userId);
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'Check if a time slot is available' })
  @ApiQuery({ name: 'service_id', required: true })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'time', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Time slot availability' })
  @HttpCode(HttpStatus.OK)
  checkAvailability(
    @Query('service_id') serviceId: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    if (!serviceId || !date || !time) {
      throw new BadRequestException('service_id, date, and time are required');
    }

    return this.bookingsService
      .checkAvailability(serviceId, date, time)
      .then((isAvailable) => ({ available: isAvailable }));
  }
}
