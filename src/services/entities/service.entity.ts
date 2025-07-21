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
//import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { ServiceAddOn } from './service-addon.entity';
import { ServiceCategory } from './service-category.entity';

import {
  ServiceType,
  VehicleType,
  ServiceStatus,
} from '../enums/service.enums';
import { Booking } from 'src/bookings/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('services')
@Index(['business_id', 'status'])
@Index(['category_id', 'status'])
@Index(['vehicle_type', 'service_type'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  business_email?: string;

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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.BASIC })
  service_type: ServiceType;

  @Column({ type: 'enum', enum: VehicleType })
  vehicle_type: VehicleType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'integer', default: 60 })
  duration_minutes: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @Column({ type: 'integer', default: 0 })
  booking_count: number;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @OneToMany(() => ServiceAddOn, (addon) => addon.service, { cascade: true })
  addons: ServiceAddOn[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
