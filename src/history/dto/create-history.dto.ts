import { IsString } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  clientPhone: string;

  @IsString()
  content: string;

  @IsString()
  type: string;

  @IsString()
  chatbotNumber: string;

  @IsString()
  role: string;
}
