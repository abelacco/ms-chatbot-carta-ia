import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsIn,
  IsObject,
  IsArray,
} from 'class-validator';
import { PaymentDetailsDto } from './payment-details.dto';
import { CoverageDto } from './coverage.dto';

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
  @IsOptional()
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

  @IsOptional()
  @IsObject()
  paymentDetails: PaymentDetailsDto[];

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsObject()
  coverage: CoverageDto[];
}
