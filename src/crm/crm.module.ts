import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { SenderModule } from 'src/sender/sender.module';
import { CtxModule } from 'src/context/ctx.module';
import { BusinessModule } from 'src/business/business.module';
import { ReminderService } from './reminder.service';
import { HistoryModule } from 'src/history/history.module';
import { DeliveryCrmService } from './deliveryCrm.service';
import { DefaultTemplatesService } from './defaultTemplates.service';

@Module({
  controllers: [CrmController],
  providers: [
    CrmService,
    ReminderService,
    DeliveryCrmService,
    DefaultTemplatesService,
  ],
  imports: [
    BuilderTemplatesModule,
    SenderModule,
    CtxModule,
    BusinessModule,
    HistoryModule,
  ],
  exports: [ReminderService, DeliveryCrmService, CrmService],
})
export class CrmModule {}
