import { IsString, IsEnum } from 'class-validator';
import { ORDER_STATUS } from 'src/common/constants';
import { EnumOrderStatus } from 'src/common/enums';

export class UpdateOrderStatusDto {
  @IsString()
  order: string;

  @IsEnum(EnumOrderStatus, { message: 'Invalid order status' })
  orderStatus: EnumOrderStatus;
}
