import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CtxService } from 'src/context/ctx.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly ctxService: CtxService) {}
  @Cron('0 0 * * * *')
  async resetCtxAtFourAm() {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'UTC',
      hour: '2-digit',
      hour12: false,
    };
    const fortmat = new Intl.DateTimeFormat('en-US', options);
    const GMTHour = fortmat.format(date);
    const peruHour = parseInt(GMTHour) - 5;

    if (peruHour === 4) {
      await this.ctxService.resetAllCtx();
    }
  }
}
