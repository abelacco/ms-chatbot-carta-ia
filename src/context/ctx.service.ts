import { Injectable, Logger } from '@nestjs/common';
import { Ctx } from './entities/ctx.entity';
import { MongoDbService } from './db/mongodb.service';
import { ICtxDao } from './db/ctxDao';
import {
  SwitchBotDto,
  SwitchBotGlobalDto,
  UpdateCtxDto,
  UpdateOrderStatusDto,
} from './dto';
import {
  HELP_STATUS,
  ORDER_STATUS_BOT,
  STATUS_BOT,
} from 'src/common/constants';
import { CancelHelpDto } from './dto/cancel-help.dto';
import { ManualOrderDto } from './dto/manual-order.dto';
import { orderCdDummy } from './helpers/orderCdDummy';
import { STEPS } from './helpers/constants';
// import { UpdateCtxDto } from '../bot/dto/update-message.dto';

@Injectable()
export class CtxService {
  private readonly _db: ICtxDao;

  constructor(private readonly _mongoDbService: MongoDbService) {
    this._db = this._mongoDbService;
  }

  async findOrCreateCtx({ clientPhone, chatbotNumber }): Promise<Ctx> {
    //Busca mensaje por número de cliente
    const message = await this._db.findOrCreate(clientPhone, chatbotNumber);

    return message;
  }

  async findAllCtx(): Promise<Array<Ctx>> {
    //Busca mensaje por número de cliente
    const messages = await this._db.findAll();
    return messages;
  }

  async updateCtx(id: string, updateCtx: UpdateCtxDto): Promise<Ctx> {
    //Busca mensaje por número de cliente

    const updatedMessage = await this._db.updateCtx(id, updateCtx);

    return updatedMessage;
  }

  async switchBotCtx(switchBot: SwitchBotDto): Promise<Ctx> {
    const ctx = await this.findOrCreateCtx({
      clientPhone: switchBot.clientPhone,
      chatbotNumber: switchBot.chatBotNumber,
    });
    if (switchBot.status === STATUS_BOT.OFF) {
      ctx.statusBot = STATUS_BOT.OFF;
    } else if (switchBot.status === STATUS_BOT.ON) {
      ctx.statusBot = STATUS_BOT.ON;
    }

    const ctxUpdated = await this.updateCtx(ctx._id, ctx);

    return ctxUpdated;
  }

  async switchBotGlobalCtx(switchBot: SwitchBotGlobalDto): Promise<Ctx> {
    const ctx = await this.findOrCreateCtx({
      clientPhone: switchBot.chatBotNumber,
      chatbotNumber: switchBot.chatBotNumber,
    });
    if (switchBot.status === STATUS_BOT.OFF) {
      ctx.statusBot = STATUS_BOT.OFF;
    } else if (switchBot.status === STATUS_BOT.ON) {
      ctx.statusBot = STATUS_BOT.ON;
    }

    const ctxUpdated = await this.updateCtx(ctx._id, ctx);

    return ctxUpdated;
  }

  async getCtxByOrderId(orderId: string): Promise<Ctx> {
    const ctx = await this._db.findByOrder(orderId);
    return ctx;
  }

  async updateStatusOrder(updateOrder: UpdateOrderStatusDto): Promise<Ctx> {
    const ctx = await this._db.findByOrder(updateOrder.order);
    ctx.orderStatus = updateOrder.orderStatus;
    const ctxUpdated = await this.updateCtx(ctx._id, ctx);
    return ctxUpdated;
  }

  async cancelHelpStatus(body: CancelHelpDto) {
    const ctx = await this.findOrCreateCtx({
      clientPhone: body.clientPhone,
      chatbotNumber: body.chatBotNumber,
    });
    ctx.help = HELP_STATUS.OFF;
    ctx.statusBot = STATUS_BOT.ON;
    const ctxUpdated = await this.updateCtx(ctx._id, ctx);
    return ctxUpdated;
  }

  async removeAll() {
    try {
      await this._db.removeAll();
    } catch (error) {
      throw error;
    }
  }

  async manualOrder(body: ManualOrderDto) {
    const ctx = await this.findOrCreateCtx({
      clientPhone: body.clientPhone,
      chatbotNumber: body.chatBotNumber,
    });
    ctx.clientname = ctx.clientname || body.clientName;
    ctx.orderName = body.clientName;
    ctx.orderStatus = ORDER_STATUS_BOT.orden_con_pago;
    ctx.step = STEPS.ORDERED;
    ctx.deliveryCost = body.deliveryCost;
    ctx.currentOrderId = body.orderId;
    ctx.nameOrCorporateName = body.nameOrCorporateName;
    ctx.dni = body.dni;
    ctx.total = body.price;
    const orderCd = orderCdDummy;
    orderCd.items[0].name = body.order;
    ctx.currentOrder = orderCd;
    ctx.lng = body.longitude;
    ctx.lat = body.latitude;
    ctx.paymentMethod = body.paymentMethod;
    ctx.address = body.address;
    ctx.isManual = true;
    await this.updateCtx(ctx._id, ctx);
    return ctx;
  }

  async resetAllCtx() {
    await this._db.resetAllCtx();
  }

  async getCtxesByChatbotNumber(chatbotNumber: string) {
    const ctxes = await this._db.getCtxesByChatbotNumber(chatbotNumber);
    return ctxes;
  }
}
