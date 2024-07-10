import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  status: number;

  @IsString()
  @IsOptional()
  currentOrderId: string;

  @IsNumber()
  @IsOptional()
  timeToRestaurant: number;

  @IsString()
  @IsOptional()
  note: string;
}
