import { IsString } from 'class-validator';

export class getOrderByIdBodyDto {
  @IsString()
  chatbotNumber: string;
}
