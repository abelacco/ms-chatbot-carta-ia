import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'char', length: 191, nullable: true, name: 'google_id' })
  google_id: string;

  @Column({ type: 'char', length: 191, nullable: true, name: 'fb_id' })
  fb_id: string;

  @Column({ type: 'varchar', length: 191 })
  name: string;

  @Column({ type: 'varchar', length: 191 })
  email: string;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verified_at' })
  email_verified_at: Date;

  @Column({ type: 'varchar', length: 191, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 191 })
  api_token: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'remember_token',
  })
  rememberToken: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'tinyint' })
  active: number;

  @Column({ type: 'varchar', length: 191, nullable: true, name: 'stripe_id' })
  stripe_id: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: 'card_brand' })
  card_brand: string;

  @Column({
    type: 'varchar',
    length: 4,
    nullable: true,
    name: 'card_last_four',
  })
  card_last_four: string;

  @Column({ type: 'timestamp', nullable: true, name: 'trial_ends_at' })
  trial_ends_at: Date;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'verification_code',
  })
  verification_code: string;

  @Column({ type: 'timestamp', nullable: true, name: 'phone_verified_at' })
  phone_verified_at: Date;

  @Column({ type: 'bigint', nullable: true, name: 'plan_id' })
  plan_id: number;

  @Column({ type: 'varchar', length: 191, name: 'plan_status' })
  plan_status: string;

  @Column({ type: 'varchar', length: 555, name: 'cancel_url' })
  cancel_url: string;

  @Column({ type: 'varchar', length: 555, name: 'update_url' })
  update_url: string;

  @Column({ type: 'varchar', length: 555, name: 'checkout_id' })
  checkout_id: string;

  @Column({ type: 'varchar', length: 555, name: 'subscription_plan_id' })
  subscription_plan_id: string;

  @Column({ type: 'varchar', length: 191, name: 'stripe_account' })
  stripe_account: string;

  @Column({ type: 'varchar', length: 191, name: 'birth_date' })
  birth_date: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  lat: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  lng: string;

  @Column({ type: 'int' })
  working: number;

  @Column({ type: 'int', nullable: true })
  onorder: number;

  @Column({ type: 'int' })
  numorders: number;

  @Column({ type: 'int' })
  rejectedorders: number;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'paypal_subscribtion_id',
  })
  paypal_subscription_id: string;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'mollie_customer_id',
  })
  mollieCustomer_id: string;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'mollie_mandate_id',
  })
  mollie_mandate_id: string;

  @Column({ type: 'decimal', precision: 6, scale: 4 })
  tax_percentage: number;

  @Column({ type: 'text', nullable: true, name: 'extra_billing_information' })
  extra_billing_information: string;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'mollie_subscribtion_id',
  })
  mollie_subscription_id: string;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'paystack_subscribtion_id',
  })
  paystack_subscription_id: string;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'paystack_trans_id',
  })
  paystack_trans_id: string;

  @Column({ type: 'bigint', nullable: true, name: 'restaurant_id' })
  restaurant_id: number;

  @ManyToOne(() => CompanyEntity, (company) => company.id)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: CompanyEntity;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date;

  @Column({ type: 'text', nullable: true })
  expotoken: string;

  @Column({ type: 'varchar', length: 191, nullable: true, name: 'pm_type' })
  pm_type: string;

  @Column({ type: 'varchar', length: 4, nullable: true, name: 'pm_last_four' })
  pm_last_four: string;
}
