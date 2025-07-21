import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  // Additional properties can be added here if needed
  // For example, if you want to allow updating the status of a booking
  status?: BookingStatus; // Assuming status is a string, adjust as necessary
  // You can also add other fields that you might want to update
}
