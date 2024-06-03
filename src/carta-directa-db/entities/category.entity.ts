import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanyEntity } from './company.entity';
import { ItemEntity } from './item.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'bigint' })
  restorant_id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @Column({ type: 'int', default: 1 })
  active: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CompanyEntity, (company) => company.categories)
  @JoinColumn({ name: 'restorant_id' })
  company: CompanyEntity;

  @OneToMany(() => ItemEntity, (item) => item.category)
  items: ItemEntity[];
}
