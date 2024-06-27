import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CtxModule } from 'src/context/ctx.module';
import { CrmModule } from 'src/crm/crm.module';

@Module({
  providers: [SchedulerService],
  imports: [CtxModule, CrmModule],
})
export class SchedulerModule {}
