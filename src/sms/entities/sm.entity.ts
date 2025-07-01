import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SMSStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum SMSType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_REMINDER = 'booking_reminder',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  OTP = 'otp',
  PROMOTIONAL = 'promotional',
  SYSTEM = 'system',
}

@Entity('sms_logs')
export class SMS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: SMSType })
  type: SMSType;

  @Column({ type: 'enum', enum: SMSStatus, default: SMSStatus.PENDING })
  status: SMSStatus;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  booking_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  external_id: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
