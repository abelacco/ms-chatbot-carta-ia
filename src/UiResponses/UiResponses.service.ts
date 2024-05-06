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
import { EnumOrderStatus } from 'src/common/enums';
import { CtxService } from 'src/context/ctx.service';
import { STEPS } from 'src/context/helpers/constants';

@Injectable()
export class UiResponsesService {
  constructor(
    private readonly senderService: SenderService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly historyService: HistoryService,
    private readonly ctxService: CtxService,
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

    ctx.orderStatus = EnumOrderStatus[body.orderStatus];
    await this.ctxService.updateCtx(ctx._id, ctx);

    const messageContent =
      statusOrderMessageList[EnumOrderStatus[body.orderStatus]];

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
      ctx.step = STEPS.INIT;
      ctx.orderStatus = EnumOrderStatus[7];
    } else if (body.action === 1) {
      messageContent = aceptedMessage;
      ctx.step = STEPS.WAITING_LOCATION;
      ctx.orderStatus = EnumOrderStatus[2];
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
