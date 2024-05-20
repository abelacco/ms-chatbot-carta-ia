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
  deliveryCost: number;

  @IsString()
  address: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsString()
  clientName: string;

  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod: string;

  @IsString()
  note: string;
}
