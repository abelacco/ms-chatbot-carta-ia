import { IsString } from 'class-validator';

export class UpdateVariantGroupDto {
  @IsString()
  category_name: string;
}
