import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity'; // Import CompanyEntity

@Entity('hours')
export class OpeningHoursEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '0_from' })
  from_0: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '0_to' })
  to_0: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '1_from' })
  from_1: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '1_to' })
  to_1: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '2_from' })
  from_2: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '2_to' })
  to_2: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '3_from' })
  from_3: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '3_to' })
  to_3: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '4_from' })
  from_4: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '4_to' })
  to_4: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '5_from' })
  from_5: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '5_to' })
  to_5: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '6_from' })
  from_6: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: '6_to' })
  to_6: string;

  @Column({ type: 'bigint' })
  restorant_id: number;

  @ManyToOne(() => CompanyEntity, (company) => company.id)
  @JoinColumn({ name: 'restorant_id' })
  restaurant: CompanyEntity;
}
