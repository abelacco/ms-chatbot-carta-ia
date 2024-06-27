import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { SenderModule } from 'src/sender/sender.module';
import { CtxModule } from 'src/context/ctx.module';
import { BusinessModule } from 'src/business/business.module';
import { ReminderService } from './reminder.service';
import { HistoryModule } from 'src/history/history.module';

@Module({
  controllers: [CrmController],
  providers: [CrmService, ReminderService],
  imports: [
    BuilderTemplatesModule,
    SenderModule,
    CtxModule,
    BusinessModule,
    HistoryModule,
  ],
  exports: [ReminderService],
})
export class CrmModule {}
