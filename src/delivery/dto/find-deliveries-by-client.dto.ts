import { IsString } from 'class-validator';

export class FindDeliveriesByClientDto {
  @IsString()
  chatbotNumber: string;
}
