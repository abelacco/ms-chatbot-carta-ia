import { IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { PAYMENT_METHODS } from 'src/common/constants';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  order: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsNumber()
  @IsOptional()
  deliveryCost: number;

  @IsString()
  @IsOptional()
  deliveryZone: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  latitude: string;

  @IsString()
  @IsOptional()
  longitude: string;

  @IsString()
  @IsOptional()
  clientName: string;

  @IsString()
  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  paymentMethod: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsString()
  @IsOptional()
  nameOrCorporateName: string;

  @IsString()
  @IsOptional()
  dni: string;
}
