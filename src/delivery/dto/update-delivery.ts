import { IsString } from 'class-validator';

export class UpdateDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  deliveryNumber: string;

  @IsString()
  newDeliveryNumber: string;
}
