import { IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';

export class CreateExtraDto {
  @IsNumber()
  item_id: number;

  @IsPositive()
  price: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  extra_for_all_variants?: number;
}
