import { IsString, IsInt, Min, Max } from 'class-validator';
import { EnumOrderStatusBot, EnumOrderStatusCD } from 'src/common/enums';

export class ResponseOrderStatusDto {
  @IsString()
  orderId: string;

  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsInt()
  @Min(1)
  @Max(6)
  orderStatus: number;
}
