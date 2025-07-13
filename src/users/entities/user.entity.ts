import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Service } from '../../services/entities/service.entity';
import { Exclude } from 'class-transformer';

export enum Role {
  CUSTOMER = 'customer',
  SERVICE_PROVIDER = 'service_provider',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true, comment: 'Personal phone number' })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at?: Date;

  // Customer-specific fields
  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'email' })
  preferred_contact_method?: string; // 'email', 'sms', 'phone'

  @Column({ type: 'boolean', default: true })
  email_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  sms_notifications: boolean;

  @Column({ type: 'integer', default: 0 })
  total_bookings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  total_spent: number;

  @Column({ type: 'varchar', length: 50, default: 'bronze' })
  loyalty_tier: string; // 'bronze', 'silver', 'gold', 'platinum'

  @Column({ type: 'integer', default: 0 })
  loyalty_points: number;

  // Service Provider-specific fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  business_name?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  business_type?: string; // e.g., "Full Service Car Wash", "Express Car Wash", "Mobile Car Wash"

  @Column({ type: 'text', nullable: true })
  business_description?: string;

  @Column({ type: 'text', nullable: true })
  business_address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zip_code?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  business_phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  business_email?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  business_image?: string;

  // Operating Hours (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  operating_hours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ type: 'integer', default: 0 })
  total_services: number;

  @Column({ type: 'integer', default: 0 })
  total_reviews: number;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  // Relationships
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
