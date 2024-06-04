import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CtxModule } from 'src/context/ctx.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entity/order.entity';
import { MongoDbService } from './db/mongodb.service';
import { HistoryModule } from 'src/history/history.module';
import { BusinessModule } from 'src/business/business.module';
import { SenderModule } from 'src/sender/sender.module';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, MongoDbService],
  imports: [
    CtxModule,
    HistoryModule,
    SenderModule,
    BusinessModule,
    BuilderTemplatesModule,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
})
export class OrderModule {}
