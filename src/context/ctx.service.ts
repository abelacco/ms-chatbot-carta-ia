import { Injectable, Logger } from '@nestjs/common';
import { Ctx } from './entities/ctx.entity';
import { MongoDbService } from './db/mongodb.service';
import { ICtxDao } from './db/ctxDao';
import { SwitchBotDto, SwitchBotGlobalDto, UpdateCtxDto } from './dto';
import { STATUS_BOT } from 'src/common/constants';
// import { UpdateCtxDto } from '../bot/dto/update-message.dto';

@Injectable()
export class CtxService {
  private readonly _db: ICtxDao;

  constructor(private readonly _mongoDbService: MongoDbService) {
    this._db = this._mongoDbService;
  }

  async findOrCreateCtx({ clientPhone }): Promise<Ctx> {
    //Busca mensaje por número de cliente
    const message = await this._db.findOrCreate(clientPhone);

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
      clientPhone: parseInt(switchBot.clientPhone),
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
      clientPhone: 0,
    });
    if (switchBot.status === STATUS_BOT.OFF) {
      ctx.statusBot = STATUS_BOT.OFF;
    } else if (switchBot.status === STATUS_BOT.ON) {
      ctx.statusBot = STATUS_BOT.ON;
    }

    const ctxUpdated = await this.updateCtx(ctx._id, ctx);

    return ctxUpdated;
  }
}
