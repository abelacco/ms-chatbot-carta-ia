import { IsString } from 'class-validator';

export class CancelHelpDto {
  @IsString()
  chatBotNumber: string;

  @IsString()
  clientPhone: string;
}
