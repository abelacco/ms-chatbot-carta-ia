import { IsBoolean, IsString, IsIn } from 'class-validator';
import { PAYMENT_METHODS } from 'src/common/constants';
export class PaymentDetailsDto {
  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethodName: string;

  @IsBoolean()
  available: boolean;

  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;
}
