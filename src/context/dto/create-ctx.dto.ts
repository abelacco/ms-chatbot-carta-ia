import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCtxDto {
  @IsString()
  @IsOptional()
  clientName: string;

  @IsString()
  @IsOptional()
  clientPhone: string;

  @IsString()
  @IsOptional()
  dni: string;

  @IsDate()
  @IsOptional()
  date: Date;

  @IsString()
  @IsOptional()
  step: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  imageVoucher: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  parsedAvailableHours?: string;
}
