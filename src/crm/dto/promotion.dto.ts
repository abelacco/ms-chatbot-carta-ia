import { IsArray, IsString } from 'class-validator';

export class SendTextMessageDto {
  @IsString()
  chatbotNumber: string;

  @IsArray()
  bodyVariables: string[];

  @IsString()
  templateId: string;
}
