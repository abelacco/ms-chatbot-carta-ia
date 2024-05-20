import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CtxModule } from 'src/context/ctx.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entity/order.entity';
import { MongoDbService } from './db/mongodb.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, MongoDbService],
  imports: [
    CtxModule,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
})
export class OrderModule {}
