import { IsString, IsNumber, IsUrl, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsNumber()
  restaurant_id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsUrl()
  @IsOptional()
  image: string;

  @IsNumber()
  price: number;

  @IsNumber()
  category_id: number;

  /*   @IsNumber()
  @IsOptional()
  readonly available?: number;

  @IsNumber()
  @IsOptional()
  readonly has_variants?: number;

  @IsNumber()
  @IsOptional()
  readonly enable_system_variants?: number;

  @IsNumber()
  @IsOptional()
  readonly discounted_price?: number; */
}
