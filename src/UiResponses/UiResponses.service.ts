import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
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
import { ORDER_STATUS_BOT } from 'src/common/constants';
import { DeliveryService } from 'src/delivery/delivery.service';

@Injectable()
export class UiResponsesService {
  constructor(
    private readonly senderService: SenderService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly historyService: HistoryService,
    private readonly ctxService: CtxService,
    private readonly cartaDirectaService: CartaDirectaService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async responseToLocation(body: ResponseToLocationDto) {
    const messageContent = createTemplateReponseMessage(
      locationMessage,
      body.orderId,
      null,
      null,
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
    if (body.orderStatus === ORDER_STATUS_BOT.entregado) {
      ctx.step = STEPS.INIT;
      ctx.voucherUrl = '';
    } else if (body.orderStatus === ORDER_STATUS_BOT.rechazado) {
      ctx.step = STEPS.INIT;
      ctx.voucherUrl = '';
    } else if (body.orderStatus === ORDER_STATUS_BOT.pidiendo) {
      ctx.step = STEPS.INIT;
      ctx.voucherUrl = '';
    } else if (
      body.orderStatus === ORDER_STATUS_BOT.enviado &&
      !ctx.deliveryNumber
    ) {
      throw new BadRequestException('Delivery is not assigned in the context');
    }

    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.cartaDirectaService.changeOrderStatus(
      body.orderId,
      body.chatBotNumber,
      body.orderStatus,
    );

    const messageContent = statusOrderMessageList[body.orderStatus];
    if (!messageContent) {
      return body;
    }
    const templateMessage = createTemplateReponseMessage(
      messageContent,
      body.orderId,
      body.orderStatus,
      ctx,
    );

    const template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      templateMessage,
    );

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: templateMessage,
        type: 'text',
        clientName: '',
      },
      templateMessage,
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
      ctx.voucherUrl = '';
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
      body.action,
      ctx,
    );

    const template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      templateMessage,
    );

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: templateMessage,
        type: 'text',
        clientName: '',
      },
      templateMessage,
    );

    await this.senderService.sendMessages(template, body.chatBotNumber);
    return body;
  }
}
