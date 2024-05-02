import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  isInt,
  isNumber,
} from 'class-validator';

export class SwitchBotDto {
  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsNumber()
  @Min(0)
  status: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  all?: number;
}
