import { Module } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { FlowsController } from './flows.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { CtxModule } from 'src/context/ctx.module';
import { SenderModule } from 'src/sender/sender.module';
import { AiModule } from 'src/ai/ai.module';
import { HistoryModule } from 'src/history/history.module';
import { BusinessModule } from 'src/business/business.module';
import { GeneralServicesModule } from 'src/general-services/general-services.module';
import { CartaDirectaModule } from 'src/carta-directa/cartaDirecta.module';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { WspWebGatewayModule } from 'src/wsp-web-gateway/wsp-web-gateway.module';
import { UiResponseModule } from 'src/UiResponses/UiResponses.module';

@Module({
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService],
  imports: [
    CtxModule,
    BusinessModule,
    BuilderTemplatesModule,
    SenderModule,
    WspWebGatewayModule,
    UiResponseModule,
    AiModule,
    CartaDirectaModule,
    HistoryModule,
    DeliveryModule,
    GeneralServicesModule,
  ],
})
export class FlowsModule {}
