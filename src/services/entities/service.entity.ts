import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceProvider } from '../../service-provider/entities/service-provider.entity';
import { Location } from '../../location/entities/location.entity';
import { ServiceAddOn } from './service-addon.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum ServiceCategory {
  BASIC = 'basic',
  PREMIUM = 'premium',
  DELUXE = 'deluxe',
  FLEET = 'fleet',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  provider_id: string;

  @ManyToOne(() => ServiceProvider, (provider) => provider.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: ServiceProvider;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @ManyToOne(() => Location, (location) => location.services)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  duration_minutes: number;

  @Column({ type: 'enum', enum: ServiceCategory })
  category: ServiceCategory;

  @Column({ type: 'text', array: true, nullable: true })
  features: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => ServiceAddOn, (addon) => addon.service)
  addons: ServiceAddOn[];

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.service)
  reviews: Review[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
