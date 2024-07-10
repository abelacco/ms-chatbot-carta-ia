import { IsString, Length } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  //@Length(9, 9, { message: 'deliveryNumber must be exactly 9 characters long' })
  deliveryNumber: string;

  @IsString()
  name: string;
}
