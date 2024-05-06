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
import { STATUS_BOT } from 'src/common/constants';
import { EnumOrderStatus } from 'src/common/enums';
import { setWeekYear } from 'date-fns';
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
    ctx.orderStatus = EnumOrderStatus[updateOrder.orderStatus];
    const ctxUpdated = await this.updateCtx(ctx._id, ctx);
    return ctxUpdated;
  }
}
