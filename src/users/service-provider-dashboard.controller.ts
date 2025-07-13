import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceProviderDashboardService } from './service-provider-dashboard.service';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './entities/user.entity';

@ApiTags('service-provider-dashboard')
@Controller('service-provider-dashboard')
@UseGuards(AtGuard, RolesGuard)
@Roles(Role.SERVICE_PROVIDER)
@ApiBearerAuth()
export class ServiceProviderDashboardController {
  constructor(
    private readonly dashboardService: ServiceProviderDashboardService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get service provider dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats(@Request() req) {
    return this.dashboardService.getDashboardStats(req.user.sub);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get booking notifications for service provider' })
  @ApiResponse({
    status: 200,
    description: 'Booking notifications retrieved successfully',
  })
  async getBookingNotifications(@Request() req) {
    return this.dashboardService.getBookingNotifications(req.user.sub);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings for service provider' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProviderBookings(
    @Request() req,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    };

    return this.dashboardService.getProviderBookings(req.user.sub, filters);
  }

  @Patch('bookings/:bookingId/accept')
  @ApiOperation({ summary: 'Accept a booking request' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking accepted successfully' })
  async acceptBooking(
    @Request() req,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.dashboardService.acceptBooking(req.user.sub, bookingId);
  }

  @Patch('bookings/:bookingId/deny')
  @ApiOperation({ summary: 'Deny a booking request' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking denied successfully' })
  async denyBooking(
    @Request() req,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() body?: { reason?: string },
  ) {
    return this.dashboardService.denyBooking(
      req.user.sub,
      bookingId,
      body?.reason,
    );
  }

  @Patch('bookings/:bookingId/start')
  @ApiOperation({ summary: 'Start service for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Service started successfully' })
  async startService(
    @Request() req,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.dashboardService.startService(req.user.sub, bookingId);
  }

  @Patch('bookings/:bookingId/complete')
  @ApiOperation({ summary: 'Complete service for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Service completed successfully' })
  async completeService(
    @Request() req,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.dashboardService.completeService(req.user.sub, bookingId);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Update service provider location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  async updateLocation(
    @Request() req,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.dashboardService.updateLocation(
      req.user.sub,
      body.latitude,
      body.longitude,
    );
  }
}
