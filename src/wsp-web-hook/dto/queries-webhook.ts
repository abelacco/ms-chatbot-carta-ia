import { IsString } from 'class-validator';

export class WspQueriesDto {
  @IsString()
  'hub.mode';

  @IsString()
  'hub.challenge';

  @IsString()
  'hub.verify_token';
}
