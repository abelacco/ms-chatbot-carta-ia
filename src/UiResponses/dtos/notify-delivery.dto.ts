import { IsString, IsArray } from 'class-validator';

export class NotifyDeliveryDto {
  @IsString()
  orderId: string;

  @IsString()
  clientPhone: string;

  @IsArray()
  @IsString({ each: true })
  deliveryPhones: string[];
}
