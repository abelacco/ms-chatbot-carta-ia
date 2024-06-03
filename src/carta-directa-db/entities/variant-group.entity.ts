import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CompanyEntity } from 'src/carta-directa-db/entities';
import { ExtrasListEntity } from './extra.list.entity';

@Entity('extras_groups')
export class VariantsGroupEntity {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({ type: 'varchar', length: 255 })
  category_name: string;

  @Column({ type: 'bigint', unsigned: true })
  restaurant_id: bigint;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => CompanyEntity, (company) => company.variantsGroups)
  @JoinColumn({ name: 'restaurant_id' })
  company: CompanyEntity;

  @OneToMany(() => ExtrasListEntity, (extrasList) => extrasList.variantsGroup)
  extrasList: ExtrasListEntity[];
}
