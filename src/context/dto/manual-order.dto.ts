import { IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { PAYMENT_METHODS } from 'src/common/constants';

export class ManualOrderDto {
  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsString()
  order: string;

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
  orderId: string;

  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod: string;

  @IsString()
  @IsOptional()
  nameOrCorporateName: string;

  @IsString()
  @IsOptional()
  dni: string;
}
