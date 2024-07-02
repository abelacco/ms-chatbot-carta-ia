// import { PaginationMessageDto } from '../dto/pagination.dto';

import {
  CreateDeliveryDto,
  DeleteDeliveryDto,
  FindDeliveriesByClientDto,
  FindOneDeliveryDto,
  UpdateDeliveryDto,
} from '../dto';
import { Delivery } from '../entity';

export interface IDeliveryDao {
  create(create: CreateDeliveryDto): Promise<Delivery>;

  findByClient(
    findByClient: FindDeliveriesByClientDto,
  ): Promise<Array<Delivery>>;

  remove(deleteDelivery: DeleteDeliveryDto);

  update(deleteDelivery: UpdateDeliveryDto): Promise<Delivery>;

  findOne(findOneDelivery: FindOneDeliveryDto): Promise<Delivery>;

  findAll(): Promise<Array<Delivery>>;
}
