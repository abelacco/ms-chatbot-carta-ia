import { Module } from '@nestjs/common';
import UiResponseController from './UiResponses.controller';
import { UiResponsesService } from './UiResponses.service';
import { SenderModule } from 'src/sender/sender.module';
import { HistoryModule } from 'src/history/history.module';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';

@Module({
  controllers: [UiResponseController],
  providers: [UiResponsesService],
  exports: [UiResponsesService],
  imports: [
    SenderModule,
    HistoryModule,
    SenderModule,
    BuilderTemplatesModule,
    HistoryModule,
  ],
})
export class UiResponseModule {}
