import { IsString, IsEnum } from 'class-validator';
import { EnumOrderStatus } from 'src/common/enums';

export class ResponseOrderStatusDto {
  @IsString()
  orderId: string;

  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsEnum(EnumOrderStatus, { message: 'Invalid order status' })
  orderStatus: EnumOrderStatus;
}
