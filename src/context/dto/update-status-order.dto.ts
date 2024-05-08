import { IsString, IsEnum } from 'class-validator';
import { EnumOrderStatusBot, EnumOrderStatusCD } from 'src/common/enums';

export class UpdateOrderStatusDto {
  @IsString()
  order: string;

  @IsEnum(EnumOrderStatusBot, { message: 'Invalid order status' })
  orderStatus: EnumOrderStatusBot;
}
