import { IsString } from 'class-validator';

export class DeleteDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  deliveryNumber: string;
}
