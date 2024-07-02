import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateButtonTemplateDto {
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

  @IsArray()
  @ArrayMaxSize(3, { message: 'The array cannot have more than 3 elements' })
  @ArrayMinSize(1, { message: 'The array must have at least 1 element' })
  @MinLength(1, {
    each: true,
    message: 'Each button must have at least 1 character',
  })
  @MaxLength(25, {
    each: true,
    message: 'Each button cannot have more than 20 characters',
  })
  buttons: string[];
}
