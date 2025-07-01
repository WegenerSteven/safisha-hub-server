import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AnalyticsType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  USER_REGISTRATION = 'user_registration',
  SERVICE_VIEW = 'service_view',
  PAGE_VIEW = 'page_view',
  SEARCH_QUERY = 'search_query',
}

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnalyticsType })
  event_type: AnalyticsType;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  service_id: string;

  @Column({ type: 'uuid', nullable: true })
  booking_id: string;

  @Column({ type: 'jsonb', nullable: true })
  event_data: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  session_id: string;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referrer: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
