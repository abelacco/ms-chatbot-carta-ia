import { IsString, IsObject, IsIn, IsBoolean } from 'class-validator';
import { PAYMENT_METHODS } from 'src/common/constants';

class PaymentDetailsDto {
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

export class UpdatePaymentMethodDto {
  @IsString()
  chatbotNumber: string;

  @IsObject()
  paymentDetails: PaymentDetailsDto;
}
