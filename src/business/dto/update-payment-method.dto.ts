import { IsString, IsObject, IsIn, IsBoolean } from 'class-validator';
import { PaymentDetailsDto } from './payment-details.dto';

export class UpdatePaymentMethodDto {
  @IsString()
  chatbotNumber: string;

  @IsObject()
  paymentDetails: PaymentDetailsDto;
}
