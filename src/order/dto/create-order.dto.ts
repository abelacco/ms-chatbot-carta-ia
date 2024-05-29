import { IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { PAYMENT_METHODS } from 'src/common/constants';

export class CreateOrderDto {
  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsString()
  order: string;

  @IsString()
  @IsOptional()
  orderId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  deliveryCost: number;

  @IsString()
  deliveryZone: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  latitude: string;

  @IsString()
  @IsOptional()
  longitude: string;

  @IsString()
  clientName: string;

  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod: string;

  @IsString()
  note: string;

  @IsString()
  @IsOptional()
  nameOrCorporateName: string;

  @IsString()
  @IsOptional()
  dni: string;
}
