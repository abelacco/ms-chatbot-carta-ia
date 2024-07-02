import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class GetCtxByChatbotNumberDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in the format yyyy-mm-dd',
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in the format yyyy-mm-dd',
  })
  endDate: string;

  @IsOptional()
  @IsString()
  step: string;

  @IsOptional()
  @IsNumber()
  orderStatus: number;
}
