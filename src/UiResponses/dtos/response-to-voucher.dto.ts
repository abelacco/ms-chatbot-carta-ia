import { IsString, IsInt, Min, Max } from 'class-validator';

export class ResponseToVoucherDto {
  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;

  @IsString()
  orderId: string;

  @IsInt()
  @Min(0)
  @Max(1)
  action: number;
}
