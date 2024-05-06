import { IsString, IsArray } from 'class-validator';

export class NotifyDeliveryDto {
  @IsString()
  orderId: string;

  @IsString()
  clientPhone: string;

  @IsString()
  chatBotNumber: string;

  @IsArray()
  @IsString({ each: true })
  deliveryPhones: string[];
}
