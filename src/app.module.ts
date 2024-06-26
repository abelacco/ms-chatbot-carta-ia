import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WspWebHookModule } from './wsp-web-hook/wsp-web-hook.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SenderModule } from './sender/sender.module';
import { CtxModule } from './context/ctx.module';
import { BuilderTemplatesModule } from './builder-templates/builder-templates.module';
import { FlowsModule } from './flows/flows.module';
import { BotModule } from './bot/bot.module';
import { AiModule } from './ai/ai.module';
import { HistoryModule } from './history/history.module';
import { WspWebGatewayModule } from './wsp-web-gateway/wsp-web-gateway.module';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';
import { BusinessModule } from './business/business.module';
import { AuthModule } from './auth/auth.module';
import BusinessController from './business/business.controller';
import { UiResponseModule } from './UiResponses/UiResponses.module';
import { CartaDirectaModule } from './carta-directa/cartaDirecta.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CartaDirectaDbModule } from './carta-directa-db/carta-directa-db.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderModule } from './order/order.module';
import { CrmModule } from './crm/crm.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
      isGlobal: true,
    }),
    MongooseModule.forRoot(`${process.env.MONGODB}/${process.env.DB_NAME}`),
    WspWebHookModule,
    SenderModule,
    CtxModule,
    BuilderTemplatesModule,
    FlowsModule,
    BotModule,
    AiModule,
    HistoryModule,
    WspWebGatewayModule,
    BusinessModule,
    UiResponseModule,
    AuthModule,
    CartaDirectaModule,
    DeliveryModule,
    CartaDirectaDbModule,
    ScheduleModule.forRoot(),
    OrderModule,
    CrmModule,
  ],
  controllers: [AppController, BusinessController],
  providers: [AppService, SchedulerService],
})
export class AppModule {}
