import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  businessName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsString()
  businessId: string;

  @IsString()
  chatbotNumber: string;

  @IsString()
  @IsOptional()
  adminPhone: string;

  @IsString()
  businessHours: string[];

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  slogan?: string;

  // @IsOptional()
  // @IsString()
  // phoneId?: string;

  // @IsOptional()
  // @IsString()
  // accessToken?: string;

  @IsBoolean()
  isActive: boolean;
}
