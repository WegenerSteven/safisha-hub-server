import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Location } from '../../location/entities/location.entity';
import { ServiceAddOn } from './service-addon.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { ServiceCategory } from './service-category.entity';
import { ServicePricing } from './service-pricing.entity';
import {
  ServiceStatus,
  ServiceType,
  VehicleType,
} from '../enums/service.enums';

@Entity('services')
@Index(['provider_id', 'status'])
@Index(['category_id', 'status'])
@Index(['vehicle_type', 'service_type'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  provider_id: string;

  @ManyToOne(() => User, (user) => user.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ type: 'uuid', nullable: true })
  business_id: string;

  @ManyToOne(() => Business, (business) => business.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => ServiceCategory, (category) => category.services)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @ManyToOne(() => Location, (location) => location.services)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  short_description: string;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.BASIC })
  service_type: ServiceType;

  @Column({ type: 'enum', enum: VehicleType, default: VehicleType.SEDAN })
  vehicle_type: VehicleType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discounted_price: number;

  @Column({ type: 'integer', default: 60 })
  duration_minutes: number;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @Column({ type: 'text', array: true, nullable: true })
  features: string[];

  @Column({ type: 'text', array: true, nullable: true })
  requirements: string[]; // Special requirements or preparation needed

  @Column({ type: 'text', array: true, nullable: true })
  images: string[]; // Multiple image URLs

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ type: 'integer', default: 0 })
  booking_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  average_rating: number;

  @Column({ type: 'integer', default: 0 })
  review_count: number;

  @OneToMany(() => ServiceAddOn, (addon) => addon.service)
  addons: ServiceAddOn[];

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.service)
  reviews: Review[];

  @OneToMany(() => ServicePricing, (pricing) => pricing.service, {
    cascade: true,
  })
  pricing: ServicePricing[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
