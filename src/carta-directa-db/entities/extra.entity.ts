import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { ItemEntity } from './item.entity';

@Entity({ name: 'extras' })
export class ExtraEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  item_id: number;

  @Column({ type: 'double', precision: 8, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'int', default: 1 })
  extra_for_all_variants: number;

  @ManyToOne(() => ItemEntity, (item) => item.extras)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;
}
