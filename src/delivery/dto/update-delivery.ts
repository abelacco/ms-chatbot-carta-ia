import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateDeliveryDto {
  @IsString()
  chatbotNumber: string;

  @IsString()
  deliveryNumber: string;

  @IsString()
  @IsOptional()
  newDeliveryNumber: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  status: number;

  @IsString()
  @IsOptional()
  currentOrderId: string;
}
