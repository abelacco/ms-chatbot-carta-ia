import { IsOptional, IsString, Matches } from 'class-validator';

export class GetCtxByChatbotNumberDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'startDate must be in the format dd-mm-yyyy',
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'endDate must be in the format dd-mm-yyyy',
  })
  endDate: string;
}
