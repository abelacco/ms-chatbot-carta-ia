import { IsNumber, IsString } from 'class-validator';

export class AssignDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  clientPhone: string;

  @IsString()
  deliveryNumber: string;

  @IsNumber()
  timeToRestaurant: number;

  @IsString()
  note: string;
}
