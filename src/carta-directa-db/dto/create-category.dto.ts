import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsInt()
  restorant_id: number;

  @IsInt()
  @IsOptional()
  order_index?: number;
}
