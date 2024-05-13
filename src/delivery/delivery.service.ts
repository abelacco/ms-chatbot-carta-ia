import { Injectable } from '@nestjs/common';
import { MongoDbService } from './db/mongodb.service';
import { IDeliveryDao } from './db/deliveryDao';
import {
  CreateDeliveryDto,
  DeleteDeliveryDto,
  FindDeliveriesByClientDto,
  NotifyDeliveryDto,
  UpdateDeliveryDto,
} from './dto';
import { createTemplateNotifyToDelivery } from './utils/templateMessages';
import { CtxService } from 'src/context/ctx.service';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { SenderService } from 'src/sender/sender.service';

@Injectable()
export class DeliveryService {
  private readonly _db: IDeliveryDao;

  constructor(
    private readonly _mongoDbService: MongoDbService,
    private readonly ctxService: CtxService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly senderService: SenderService,
  ) {
    this._db = this._mongoDbService;
  }

  async createDelivery(body: CreateDeliveryDto) {
    try {
      const delivery = await this._db.create({
        chatbotNumber: body.chatbotNumber,
        deliveryNumber: body.deliveryNumber,
        name: body.name,
      });
      return delivery;
    } catch (error) {
      throw error;
    }
  }

  async findByClient(param: FindDeliveriesByClientDto) {
    try {
      const delivery = await this._db.findByClient({
        chatbotNumber: param.chatbotNumber,
      });
      return delivery;
    } catch (error) {
      throw error;
    }
  }

  async remove(body: DeleteDeliveryDto) {
    try {
      const delivery = await this._db.remove(body);
      return delivery;
    } catch (error) {
      throw error;
    }
  }

  async update(body: UpdateDeliveryDto) {
    try {
      const delivery = await this._db.update(body);
      return delivery;
    } catch (error) {
      throw error;
    }
  }

  async notifyDelivery(body: NotifyDeliveryDto) {
    const ctx = await this.ctxService.findOrCreateCtx({
      clientPhone: body.clientPhone,
      chatbotNumber: body.chatbotNumber,
    });
    const messageContent = createTemplateNotifyToDelivery(ctx);

    const deliveries = await this.findByClient({
      chatbotNumber: body.chatbotNumber,
    });

    deliveries.forEach(async (delivery) => {
      const template = this.builderTemplate.buildTextMessage(
        delivery.deliveryNumber,
        messageContent,
      );
      await this.senderService.sendMessages(template, body.chatbotNumber);
      if (ctx.lat && ctx.lng) {
        const template = this.builderTemplate.buildLocationMessage(
          delivery.deliveryNumber,
          parseFloat(ctx.lng),
          parseFloat(ctx.lat),
        );
        await this.senderService.sendMessages(template, body.chatbotNumber);
      }
    });

    return body;
  }
}
