import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  preferred_contact_method: string; // 'email', 'sms', 'phone'

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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
