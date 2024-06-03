import { IsNumber, IsString } from 'class-validator';

export class CreateExtraInListDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  extra_group_id: number;
}
