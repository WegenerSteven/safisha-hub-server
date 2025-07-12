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
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('service_providers')
export class ServiceProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  business_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  address: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Business phone number',
  })
  phone: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ type: 'integer', default: 0 })
  total_services: number;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

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
