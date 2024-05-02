import { IsString } from 'class-validator';

export class SenderFromUiDto {
  @IsString()
  text: string;

  @IsString()
  phoneNumber: string;
}
