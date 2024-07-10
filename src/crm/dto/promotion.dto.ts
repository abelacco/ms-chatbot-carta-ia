import { IsArray, IsString } from 'class-validator';

export class SendTextMessageDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  clientPhone: string;

  @IsArray()
  bodyVariables: string[];

  @IsString()
  templateName: string;
}
