import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CtxModule } from 'src/context/ctx.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entity/order.entity';
import { MongoDbService } from './db/mongodb.service';
import { HistoryModule } from 'src/history/history.module';
import { Business } from 'src/business/entity';
import { BusinessModule } from 'src/business/business.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, MongoDbService],
  imports: [
    CtxModule,
    HistoryModule,
    BusinessModule,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
})
export class OrderModule {}
