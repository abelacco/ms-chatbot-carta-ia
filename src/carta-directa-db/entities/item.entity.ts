import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { ExtraEntity } from './extra.entity';
@Entity('items')
export class ItemEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 191 })
  image: string;

  @Column({ type: 'double', precision: 8, scale: 2 })
  price: number;

  @Column({ type: 'bigint' })
  category_id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'int', default: 1 })
  available: number;

  @Column({ type: 'int', default: 0 })
  has_variants: number;

  @Column({ type: 'double', precision: 8, scale: 2, nullable: true })
  vat: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'int', default: 0 })
  enable_system_variants: number;

  @Column({ type: 'double', precision: 8, scale: 2, default: 0.0 })
  discounted_price: number;

  @ManyToOne(() => CategoryEntity, (category) => category.items)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => ExtraEntity, (extra) => extra.item)
  extras: ExtraEntity[];
}
