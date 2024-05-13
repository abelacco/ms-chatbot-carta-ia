import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongoExceptionHandler } from 'src/common/exceptions';
import { Model, mongo } from 'mongoose';
import { IDeliveryDao } from './deliveryDao';
import { Delivery } from '../entity';
import {
  CreateDeliveryDto,
  DeleteDeliveryDto,
  FindDeliveriesByClientDto,
  UpdateDeliveryDto,
} from '../dto';
import { DELIVERIES_STATUS } from 'src/common/constants';

@Injectable()
export class MongoDbService implements IDeliveryDao {
  constructor(
    @InjectModel(Delivery.name)
    private readonly _deliveryModel: Model<Delivery>,
  ) {}

  async create(body: CreateDeliveryDto) {
    try {
      const createDelivery = new this._deliveryModel({
        chatbotNumber: body.chatbotNumber,
        deliveryNumber: body.deliveryNumber,
        name: body.name,
        status: DELIVERIES_STATUS.sin_orden,
        currentOrderId: '',
      });

      await createDelivery.save();
      return createDelivery;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findByClient(param: FindDeliveriesByClientDto) {
    try {
      return await this._deliveryModel.find({
        chatbotNumber: param.chatbotNumber,
      });
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async remove(body: DeleteDeliveryDto) {
    try {
      return await this._deliveryModel.deleteMany(body);
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async update(body: UpdateDeliveryDto) {
    try {
      const delivery = await this._deliveryModel.findOne({
        chatbotNumber: body.chatbotNumber,
        deliveryNumber: body.deliveryNumber,
      });

      delivery.deliveryNumber =
        body.newDeliveryNumber || delivery.deliveryNumber;
      delivery.name = body.name || delivery.name;
      delivery.status = body.status || delivery.status;
      delivery.currentOrderId = body.currentOrderId || delivery.currentOrderId;

      await delivery.save();
      return delivery;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }
}
