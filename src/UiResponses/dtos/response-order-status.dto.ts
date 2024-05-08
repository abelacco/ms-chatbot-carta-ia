import { IsString, IsEnum } from 'class-validator';
import { EnumOrderStatusBot, EnumOrderStatusCD } from 'src/common/enums';

export class ResponseOrderStatusDto {
  @IsString()
  orderId: string;

  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsEnum(EnumOrderStatusBot, { message: 'Invalid order status' })
  orderStatus: EnumOrderStatusBot;
}
