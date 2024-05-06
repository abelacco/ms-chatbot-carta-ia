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

@Injectable()
export class UiResponsesService {
  constructor(
    private readonly senderService: SenderService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly historyService: HistoryService,
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

    await this.senderService.sendMessages(template);

    return body;
  }

  async responseOrderStatus(body: ResponseOrderStatusDto) {
    console.log(EnumOrderStatus[body.orderStatus]);
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

    await this.senderService.sendMessages(template);
    return body;
  }

  async responseToVoucher(body: ResponseToVoucherDto) {
    let messageContent = '';
    if (body.action === 0) {
      messageContent = rejectedMessage;
    } else if (body.action === 1) {
      messageContent = aceptedMessage;
    }

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

    await this.senderService.sendMessages(template);
    return body;
  }

  async notifyDelivery(body: NotifyDeliveryDto) {
    const messageContent = 'Notify delivery';

    body.deliveryPhones.forEach(async (numberPhone) => {
      const template = this.builderTemplate.buildTextMessage(
        numberPhone,
        messageContent,
      );
      await this.senderService.sendMessages(template);
    });

    return body;
  }
}
