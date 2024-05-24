import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { BufferStructureValidator } from '../validators';

export class CreateImageTemplateDto {
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

  @IsString()
  imageBuffer: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png'])
  imageType: string;
}
