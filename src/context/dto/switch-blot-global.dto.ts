import { IsNumber, IsString, Min } from 'class-validator';

export class SwitchBotGlobalDto {
  @IsString()
  chatBotNumber: string;

  @IsNumber()
  @Min(0)
  status: number;
}
