import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CtxService } from 'src/context/ctx.service';
import { ReminderService } from 'src/crm/reminder.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly ctxService: CtxService,
    private readonly reminderService: ReminderService,
  ) {}
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

  @Cron('*/30 * * * * *')
  async reminderStep() {
    this.reminderService.reminderPaymentMethod();
    this.reminderService.reminderVoucher();
  }
}
