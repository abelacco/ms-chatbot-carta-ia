import { IsArray, IsString } from 'class-validator';

export class CreateAllDefaultTemplatesDto {
  @IsString()
  chatbotNumber: string;
}
