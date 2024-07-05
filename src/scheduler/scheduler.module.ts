import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CtxModule } from 'src/context/ctx.module';
import { CrmModule } from 'src/crm/crm.module';
import { DeliveryModule } from 'src/delivery/delivery.module';

@Module({
  providers: [SchedulerService],
  imports: [CtxModule, DeliveryModule],
})
export class SchedulerModule {}
