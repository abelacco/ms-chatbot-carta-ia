import { IsArray, IsOptional, IsString, Matches } from 'class-validator';

export class CreateTextTemplateDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  bodyText: string;

  @IsString()
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'Template name can only contain lowercase letters, numbers, and underscores.',
  })
  templateName: string;

  @IsArray()
  variables: string[];

  @IsString()
  @IsOptional()
  footer: string;
}
