import { IsString, IsNumber } from 'class-validator';

export class CoverageDto {
  @IsString()
  area: string;

  @IsNumber()
  price: number;
}
