import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VariantsGroupEntity } from './variant-group.entity'; // Asegúrate de ajustar la ruta a la ubicación correcta de tu archivo

@Entity('extras_list')
export class ExtrasListEntity {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column({ type: 'double', precision: 8, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'bigint', unsigned: true })
  extra_group_id: number;

  @ManyToOne(
    () => VariantsGroupEntity,
    (variantsGroup) => variantsGroup.extrasList,
  )
  @JoinColumn({ name: 'extra_group_id' })
  variantsGroup: VariantsGroupEntity;
}
