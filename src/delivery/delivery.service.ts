import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoDbService } from './db/mongodb.service';
import { IDeliveryDao } from './db/deliveryDao';
import {
  AssignDeliveryDto,
  CreateDeliveryDto,
  DeleteDeliveryDto,
  FindDeliveriesByClientDto,
  FindOneDeliveryDto,
  NotifyDeliveryDto,
  UpdateDeliveryDto,
} from './dto';
import {
  createTemplateAssignDelivery,
  createTemplateCreateDelivery,
  createTemplateNotifyToDelivery,
} from './utils/templateMessages';
import { CtxService } from 'src/context/ctx.service';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { SenderService } from 'src/sender/sender.service';
import {
  DELIVERIES_STATUS,
  ORDER_STATUS_BOT,
  STATUS_BOT,
} from 'src/common/constants';
import { BusinessService } from 'src/business/business.service';

@Injectable()
export class DeliveryService {
  private readonly _db: IDeliveryDao;

  constructor(
    private readonly _mongoDbService: MongoDbService,
    private readonly ctxService: CtxService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly senderService: SenderService,
    private readonly businessService: BusinessService,
  ) {
    this._db = this._mongoDbService;
  }

  async createDelivery(body: CreateDeliveryDto) {
    body.deliveryNumber = '51' + body.deliveryNumber;
    try {
      const business = await this.businessService.getBusiness(
        body.chatbotNumber,
      );
      if (!business) {
        throw new NotFoundException(
          `Business with chatbot number ${body.chatbotNumber} not exist`,
        );
      }

      const delivery = await this._db.create({
        chatbotNumber: body.chatbotNumber,
        deliveryNumber: body.deliveryNumber,
        name: body.name,
      });

      /* Message to delivery */
      const messageTemplate = createTemplateCreateDelivery(business, delivery);
      const wspTemplate = this.builderTemplate.buildTextMessage(
        body.deliveryNumber,
        messageTemplate,
      );
      await this.senderService.sendMessages(wspTemplate, body.chatbotNumber);

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

  async findOne(query: FindOneDeliveryDto) {
    try {
      const delivery = await this._db.findOne({
        chatbotNumber: query.chatbotNumber,
        deliveryNumber: query.deliveryNumber,
      });
      if (!delivery) {
        throw new NotFoundException('Delivery not found');
      }
      return delivery;
    } catch (error) {
      throw error;
    }
  }

  async assignDelivery(body: AssignDeliveryDto) {
    try {
      /* Find ctx y delivery */
      const ctx = await this.ctxService.findOrCreateCtx({
        clientPhone: body.clientPhone,
        chatbotNumber: body.chatbotNumber,
      });

      if (!ctx.lat || !ctx.lng) {
        throw new NotFoundException(`Ctx dont have longitude and location`);
      }

      let delivery = await this.findOne({
        chatbotNumber: body.chatbotNumber,
        deliveryNumber: body.deliveryNumber,
      });

      /* update  ctx y delivery */
      delivery = await this._db.update({
        chatbotNumber: body.chatbotNumber,
        deliveryNumber: body.deliveryNumber,
        status: DELIVERIES_STATUS.con_orden,
        currentOrderId: ctx.currentOrderId,
        note: body.note,
        timeToRestaurant: body.timeToRestaurant,
        newDeliveryNumber: '',
        name: '',
      });

      ctx.deliveryNumber = delivery.deliveryNumber;
      ctx.deliveryName = delivery.name;
      await this.ctxService.updateCtx(ctx._id, ctx);

      /* Message to delivery */
      const messageTemplate = createTemplateAssignDelivery(ctx, delivery);
      console.log(messageTemplate);

      const locationTemplate = this.builderTemplate.buildLocationMessage(
        body.deliveryNumber,
        parseFloat(ctx.lng),
        parseFloat(ctx.lat),
      );
      await this.senderService.sendMessages(
        locationTemplate,
        body.chatbotNumber,
      );

      const buttonTemplate = this.builderTemplate.buildInteractiveButtonMessage(
        body.deliveryNumber,
        messageTemplate,
        [{ id: ctx.clientPhone, title: 'Confirmar entrega' }],
      );
      await this.senderService.sendMessages(buttonTemplate, body.chatbotNumber);

      return delivery;
    } catch (error) {
      throw error;
    }
  }
}
