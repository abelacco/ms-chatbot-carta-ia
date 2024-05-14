import { IsString } from 'class-validator';

export class FindOneDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  deliveryNumber: string;
}
