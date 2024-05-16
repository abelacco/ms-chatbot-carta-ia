import { IsNumber, IsString } from 'class-validator';

export class ManualOrderDto {
  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsString()
  order: string;

  @IsString()
  orderId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  deliveryCost: number;
}
