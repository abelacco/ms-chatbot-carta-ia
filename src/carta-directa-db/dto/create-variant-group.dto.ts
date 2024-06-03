import { IsNumber, IsString } from 'class-validator';

export class CreateVariantGroupDto {
  @IsString()
  category_name: string;

  @IsNumber()
  restaurant_id: number;
}
