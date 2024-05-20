import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { CtxService } from 'src/context/ctx.service';
import { IOrderDao } from './db/orderDao';
import { MongoDbService } from './db/mongodb.service';

console.log(uuidv4());

@Injectable()
export class OrderService {
  private readonly _db: IOrderDao;
  constructor(
    private readonly _mongoDbService: MongoDbService,
    private readonly ctxService: CtxService,
  ) {
    this._db = this._mongoDbService;
  }

  async create(createOrderDto: CreateOrderDto) {
    const order = {
      ...createOrderDto,
      orderId: uuidv4(),
    };

    const ctx = await this.ctxService.manualOrder(order);
    const createdOrder = this._db.create(order);
    return createdOrder;
  }

  async findAll() {
    const orders = await this._db.findAll();
    return orders;
  }

  async findOne(id: string) {
    const order = await this._db.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with orderId: ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this._db.update(id, updateOrderDto);
    const ctx = await this.ctxService.manualOrder(order);
    return order;
  }
}
