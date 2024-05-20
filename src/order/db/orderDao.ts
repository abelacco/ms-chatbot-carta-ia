import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { Order } from '../entity/order.entity';

export interface IOrderDao {
  findAll(): Promise<Array<Order>>;

  create(body: CreateOrderDto): Promise<Order>;

  findOne(id: string): Promise<Order>;

  update(id: string, body: UpdateOrderDto): Promise<Order>;
}
