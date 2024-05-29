import { IsNumber, IsString } from 'class-validator';

export class CoverageFromXlsxToDbDto {
  @IsString()
  xlsxFile: string;

  @IsNumber()
  restaurantId: number;
}
