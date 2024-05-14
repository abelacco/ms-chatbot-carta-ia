import { Module } from '@nestjs/common';
import UiResponseController from './UiResponses.controller';
import { UiResponsesService } from './UiResponses.service';
import { SenderModule } from 'src/sender/sender.module';
import { HistoryModule } from 'src/history/history.module';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { CtxModule } from 'src/context/ctx.module';
import { CartaDirectaModule } from 'src/carta-directa/cartaDirecta.module';
import { DeliveryModule } from 'src/delivery/delivery.module';

@Module({
  controllers: [UiResponseController],
  providers: [UiResponsesService],
  exports: [UiResponsesService],
  imports: [
    SenderModule,
    HistoryModule,
    DeliveryModule,
    SenderModule,
    BuilderTemplatesModule,
    HistoryModule,
    CtxModule,
    CartaDirectaModule,
  ],
})
export class UiResponseModule {}
