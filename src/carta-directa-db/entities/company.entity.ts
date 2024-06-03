import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VariantsGroupEntity } from './variant-group.entity';
import { CategoryEntity } from './category.entity';

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  subdomain: string;

  @Column({ type: 'varchar', length: 191 })
  logo: string;

  @Column({ type: 'varchar', length: 191 })
  cover: string;

  @Column({ type: 'tinyint' })
  active: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'varchar', length: 191 })
  lat: string;

  @Column({ type: 'varchar', length: 191 })
  lng: string;

  @Column({ type: 'varchar', length: 191 })
  address: string;

  @Column({ type: 'varchar', length: 191 })
  phone: string;

  @Column({ type: 'varchar', length: 191, default: '0' })
  minimum: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'double', precision: 8, scale: 2 })
  fee: number;

  @Column({ type: 'double', precision: 8, scale: 2 })
  static_fee: number;

  @Column({ type: 'varchar', length: 800 })
  radius: string;

  @Column({ type: 'tinyint' })
  is_featured: number;

  @Column({ type: 'int', nullable: true })
  city_id: number;

  @Column({ type: 'int' })
  views: number;

  @Column({ type: 'int' })
  can_pickup: number;

  @Column({ type: 'int' })
  can_deliver: number;

  @Column({ type: 'int' })
  self_deliver: number;

  @Column({ type: 'int' })
  free_deliver: number;

  @Column({ type: 'varchar', length: 191, nullable: true })
  whatsapp_phone: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  fb_username: string;

  @Column({ type: 'int' })
  do_covertion: number;

  @Column({ type: 'varchar', length: 191 })
  currency: string;

  @Column({ type: 'varchar', length: 191 })
  payment_info: string;

  @Column({ type: 'varchar', length: 191 })
  mollie_payment_key: string;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'int' })
  can_dinein: number;

  @OneToMany(
    () => VariantsGroupEntity,
    (variantsGroup) => variantsGroup.company,
  )
  variantsGroups: VariantsGroupEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.company)
  categories: CategoryEntity[];
}
