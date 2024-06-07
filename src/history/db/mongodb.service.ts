import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { IHistoryDao } from './historyDao';
import { History } from '../entities/history.entity';
import { CreateHistoryDto } from '../dto';
import { mongoExceptionHandler } from 'src/common/exceptions';

@Injectable()
export class MongoDbService implements IHistoryDao {
  constructor(
    @InjectModel(History.name) private readonly _historyModel: Model<History>,
  ) {}

  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    try {
      const createdHistory = new this._historyModel(createHistoryDto);
      return await createdHistory.save();
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findAll(
    clientPhone: string,
    chatbotNumber: string,
  ): Promise<History[]> {
    try {
      return await this._historyModel
        .find({ clientPhone, chatbotNumber })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async removeAll(): Promise<void> {
    try {
      await this._historyModel.deleteMany({});
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  findLastLocationMessage(
    clientPhone: string,
    chatbotNumber: string,
  ): Promise<History> {
    return this._historyModel
      .findOne({
        type: 'location',
        chatbotNumber: chatbotNumber,
        clientPhone: clientPhone,
        role: 'user',
      })
      .sort({ _id: -1 });
  }

  async findLastMessage(
    clientPhone: string,
    chatbotNumber: string,
  ): Promise<History> {
    const lastMessage = await this._historyModel
      .findOne({
        chatbotNumber: chatbotNumber,
        clientPhone: clientPhone,
      })
      .sort({ createdAt: -1 });
    return lastMessage;
  }
}
