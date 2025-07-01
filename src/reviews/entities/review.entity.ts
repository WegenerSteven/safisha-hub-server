import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  booking_id: string;

  @OneToOne(() => Booking, (booking) => booking.review)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  service_id: string;

  @ManyToOne(() => Service, (service) => service.reviews)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'integer' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
