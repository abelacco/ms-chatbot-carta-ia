import { IsString } from 'class-validator';

export class UpdateMetaAccess {
  @IsString()
  phoneId: string;

  @IsString()
  accessToken: string;

  @IsString()
  whatsappId: string;

  @IsString()
  appId: string;
}
