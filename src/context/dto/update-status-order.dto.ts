import { IsString, IsIn } from 'class-validator';
import { ORDER_STATUS } from 'src/common/constants';
export class UpdateOrderStatusDto {
  @IsString()
  order: string;

  @IsString()
  @IsIn([
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.ACEPTED_BY_ADMIN,
    ORDER_STATUS.CLOSED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.JUST_CREATED,
    ORDER_STATUS.PICKED_UP,
    ORDER_STATUS.PREPARED_BY_RESTAURANT,
    ORDER_STATUS.REJECTED_BY_ADMIN,
    ORDER_STATUS.REJECTED_BY_RESTAURANT,
  ])
  orderStatus: string;
}
