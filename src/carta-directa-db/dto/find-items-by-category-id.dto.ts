import { IsNumber, IsString } from 'class-validator';

export class FindItemsByCategoryIdDto {
  @IsNumber()
  category_id: number;

  @IsNumber()
  restaurant_id: number;
}
