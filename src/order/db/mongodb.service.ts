import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongoExceptionHandler } from 'src/common/exceptions';
import { Model, mongo } from 'mongoose';
import { Order } from '../entity/order.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { IOrderDao } from './orderDao';
import { MongoError } from 'typeorm';

@Injectable()
export class MongoDbService implements IOrderDao {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const createdOrder = new this.orderModel(createOrderDto);
    return createdOrder.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findOne({
      orderId: id,
    });
  }

  async update(id: string, body: UpdateOrderDto) {
    try {
      const order = await this.orderModel.findOne({ orderId: id });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      order.order = body.order || order.order;
      order.price = body.price !== undefined ? body.price : order.price;
      order.deliveryCost =
        body.deliveryCost !== undefined
          ? body.deliveryCost
          : order.deliveryCost;
      order.address = body.address || order.address;
      order.latitude = body.latitude || order.latitude;
      order.longitude = body.longitude || order.longitude;
      order.clientName = body.clientName || order.clientName;
      order.paymentMethod = body.paymentMethod || order.paymentMethod;
      order.note = body.note || order.note;

      await order.save();
      return order;
    } catch (error) {
      throw new NotImplementedException(error.message, error);
    }
  }
}
