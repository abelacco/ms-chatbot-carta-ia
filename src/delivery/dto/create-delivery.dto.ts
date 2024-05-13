import { IsString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  deliveryNumber: string;
}
