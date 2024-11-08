import { Module } from '@nestjs/common';

import { MongoDbService } from './db/mongodb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Delivery, DeliverySchema } from './entity';
import Deliverycontroller from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { CtxModule } from 'src/context/ctx.module';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { SenderModule } from 'src/sender/sender.module';
import { BusinessModule } from 'src/business/business.module';
import { HistoryModule } from 'src/history/history.module';
import { CrmModule } from 'src/crm/crm.module';

@Module({
  controllers: [Deliverycontroller],
  providers: [DeliveryService, MongoDbService],
  exports: [DeliveryService],
  imports: [
    CtxModule,
    BusinessModule,
    BuilderTemplatesModule,
    CrmModule,
    HistoryModule,
    SenderModule,
    MongooseModule.forFeature([
      {
        name: Delivery.name,
        schema: DeliverySchema,
      },
    ]),
  ],
})
export class DeliveryModule {}
