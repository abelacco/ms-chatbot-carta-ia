import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendButtonMessageDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  clientPhone: string;

  @IsArray()
  bodyVariables: string[];

  @IsString()
  templateName: string;

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
  buttonsPayload: string[];
}
