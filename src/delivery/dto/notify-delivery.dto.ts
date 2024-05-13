import { IsString } from 'class-validator';

export class NotifyDeliveryDto {
  @IsString()
  clientPhone: string;

  @IsString()
  chatbotNumber: string;
}
