import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CtxModule } from 'src/context/ctx.module';

@Module({
  providers: [SchedulerService],
  imports: [CtxModule],
})
export class SchedulerModule {}
