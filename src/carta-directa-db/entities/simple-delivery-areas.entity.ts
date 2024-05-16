import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity'; // Import CompanyEntity

@Entity('simple_delivery_areas')
export class SimpleDeliveryAreasEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'double', precision: 8, scale: 2 })
  cost: number;

  @Column({ type: 'bigint', nullable: true })
  restaurant_id: number;

  @ManyToOne(() => CompanyEntity, (company) => company.id)
  @JoinColumn({ name: 'restaurant_id', referencedColumnName: 'id' })
  restaurant: CompanyEntity;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 191 })
  phone: string;
}
