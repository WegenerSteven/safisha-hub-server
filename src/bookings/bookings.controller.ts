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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUserId } from '../auth/decorators/get-current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AtGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get('my-bookings')
  getMyBookings(@GetCurrentUserId() userId: string) {
    return this.bookingsService.findByUserId(userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.bookingsService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.bookingsService.update(+id, updateBookingDto, userId);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @GetCurrentUserId() userId: string,
  ) {
    return this.bookingsService.cancel(+id, userId, body.reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.bookingsService.remove(+id, userId);
  }
}
