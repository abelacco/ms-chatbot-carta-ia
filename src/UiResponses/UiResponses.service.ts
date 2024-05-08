import { Injectable } from '@nestjs/common';
import {
  NotifyDeliveryDto,
  ResponseOrderStatusDto,
  ResponseToLocationDto,
  ResponseToVoucherDto,
} from './dtos';
import { SenderService } from 'src/sender/sender.service';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { HistoryService } from 'src/history/history.service';
import { createTemplateReponseMessage } from './Utils/templateMessage';
import {
  aceptedMessage,
  locationMessage,
  rejectedMessage,
  statusOrderMessageList,
} from './Utils/textMessages';
import { CtxService } from 'src/context/ctx.service';
import { STEPS } from 'src/context/helpers/constants';
import { CartaDirectaService } from 'src/carta-directa/cartaDirecta.service';

@Injectable()
export class UiResponsesService {
  constructor(
    private readonly senderService: SenderService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly historyService: HistoryService,
    private readonly ctxService: CtxService,
    private readonly cartaDirectaService: CartaDirectaService,
  ) {}

  async responseToLocation(body: ResponseToLocationDto) {
    const messageContent = createTemplateReponseMessage(
      locationMessage,
      body.orderId,
    );

    const template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      messageContent,
    );

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: messageContent,
        type: 'text',
        clientName: '',
      },
      messageContent,
    );

    await this.senderService.sendMessages(template, body.chatBotNumber);

    return body;
  }

  async responseOrderStatus(body: ResponseOrderStatusDto) {
    const ctx = await this.ctxService.findOrCreateCtx({
      clientPhone: body.clientPhone,
      chatbotNumber: body.chatBotNumber,
    });

    ctx.orderStatus = body.orderStatus;
    if (body.orderStatus === 6) {
      ctx.step = STEPS.INIT;
    }

    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.cartaDirectaService.changeOrderStatus(
      body.orderId,
      body.chatBotNumber,
      body.orderStatus,
    );
    const messageContent = statusOrderMessageList[body.orderStatus];
    console.log(body.orderStatus);
    const templateMessage = createTemplateReponseMessage(
      messageContent,
      body.orderId,
    );

    const template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      templateMessage,
    );

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: messageContent,
        type: 'text',
        clientName: '',
      },
      messageContent,
    );

    await this.senderService.sendMessages(template, body.chatBotNumber);
    return body;
  }

  async responseToVoucher(body: ResponseToVoucherDto) {
    const ctx = await this.ctxService.findOrCreateCtx({
      clientPhone: body.clientPhone,
      chatbotNumber: body.chatBotNumber,
    });
    let messageContent = '';

    if (body.action === 0) {
      messageContent = rejectedMessage;
      await this.cartaDirectaService.rejectorder(
        body.orderId,
        body.chatBotNumber,
      );
    } else if (body.action === 1) {
      messageContent = aceptedMessage;
      ctx.step = STEPS.WAITING_LOCATION;
      ctx.orderStatus = 2;
      await this.cartaDirectaService.acceptOrder(
        body.orderId,
        body.chatBotNumber,
      );
    }

    await this.ctxService.updateCtx(ctx._id, ctx);

    const templateMessage = createTemplateReponseMessage(
      messageContent,
      body.orderId,
    );

    const template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      templateMessage,
    );

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: messageContent,
        type: 'text',
        clientName: '',
      },
      messageContent,
    );

    await this.senderService.sendMessages(template, body.chatBotNumber);
    return body;
  }

  async notifyDelivery(body: NotifyDeliveryDto) {
    const messageContent = 'Notify delivery';

    body.deliveryPhones.forEach(async (numberPhone) => {
      const template = this.builderTemplate.buildTextMessage(
        numberPhone,
        messageContent,
      );
      await this.senderService.sendMessages(template, body.chatBotNumber);
    });

    return body;
  }
}
