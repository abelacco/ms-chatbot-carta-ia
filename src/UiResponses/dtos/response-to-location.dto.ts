import { IsString } from 'class-validator';

export class ResponseToLocationDto {
  @IsString()
  orderId: string;

  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;
}
