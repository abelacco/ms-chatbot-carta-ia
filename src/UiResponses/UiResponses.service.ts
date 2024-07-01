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
  acceptedMessageWithoutLocation,
  aceptedMessage,
  aceptedMessageWithoutLocation,
  isOtherLocationMessage,
  locationMessage,
  orderReadyToPickUp,
  rejectedMessage,
  statusOrderMessageList,
} from './Utils/textMessages';
import { CtxService } from 'src/context/ctx.service';
import { STEPS } from 'src/context/helpers/constants';
import { CartaDirectaService } from 'src/carta-directa/cartaDirecta.service';
import { DELIVERY_METHOD, ORDER_STATUS_BOT } from 'src/common/constants';
import { DeliveryService } from 'src/delivery/delivery.service';
import { Ctx } from 'src/context/entities/ctx.entity';

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
      ctx.orders.push(ctx.currentOrderId);
      ctx.step = STEPS.INIT;
    } else if (body.orderStatus === ORDER_STATUS_BOT.rechazado) {
      ctx.step = STEPS.INIT;
      ctx.voucherUrl = '';
    } else if (body.orderStatus === ORDER_STATUS_BOT.sin_pedido) {
      ctx.step = STEPS.INIT;
      ctx.voucherUrl = '';
    } else if (body.orderStatus === ORDER_STATUS_BOT.enviado) {
      ctx.step = STEPS.ORDERED;
    }
    if (
      body.orderStatus === ORDER_STATUS_BOT.enviado &&
      !ctx.deliveryNumber &&
      ctx.deliveryMethod === DELIVERY_METHOD.delivery
    ) {
      throw new BadRequestException('Delivery is not assigned in the context');
    }

    await this.ctxService.updateCtx(ctx._id, ctx);
    await this.cartaDirectaService.changeOrderStatus(
      body.orderId,
      body.chatBotNumber,
      body.orderStatus,
    );
    let messageContent: string;
    if (
      body.orderStatus === ORDER_STATUS_BOT.enviado &&
      ctx.deliveryMethod === DELIVERY_METHOD.pick_up
    ) {
      messageContent = orderReadyToPickUp;
    } else {
      messageContent = statusOrderMessageList[body.orderStatus];
    }
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
    } else if (
      body.action === 1 &&
      ctx.deliveryMethod === DELIVERY_METHOD.pick_up
    ) {
      messageContent = aceptedMessageWithoutLocation;
      ctx.orderStatus = ORDER_STATUS_BOT.en_preparacion;
      ctx.step = STEPS.ORDERED;
      await this.cartaDirectaService.acceptOrder(
        body.orderId,
        body.chatBotNumber,
      );
    } else if (body.action === 1) {
      messageContent = aceptedMessage;
      ctx.step = STEPS.WAITING_LOCATION;
      ctx.orderStatus = ORDER_STATUS_BOT.en_preparacion;
      await this.cartaDirectaService.acceptOrder(
        body.orderId,
        body.chatBotNumber,
      );
    }

    await this.ctxService.updateCtx(ctx._id, ctx);
    if (ctx.lat && ctx.lng && body.action === 1) {
      await this.sendAcceptVocuherWithoutPreviusLocation(body, ctx);
    } else {
      await this.sendAcceptVoucherWithPreviusLocation(
        body,
        ctx,
        messageContent,
      );
    }
    return body;
  }

  async sendAcceptVocuherWithoutPreviusLocation(
    body: ResponseToVoucherDto,
    ctx: Ctx,
  ) {
    let template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      createTemplateReponseMessage(
        acceptedMessageWithoutLocation,
        ctx.currentOrderId,
        ctx.orderStatus,
        ctx,
      ),
    );

    await this.senderService.sendMessages(template, body.chatBotNumber);

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: template,
        type: 'text',
        clientName: '',
      },
      template.text.body,
    );

    const locationTemplate = this.builderTemplate.buildLocationMessage(
      body.clientPhone,
      parseFloat(ctx.lng),
      parseFloat(ctx.lat),
    );
    await this.senderService.sendMessages(locationTemplate, body.chatBotNumber);

    const messageLocationContent = `${ctx.lat}, ${ctx.lng}`;
    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientName: ctx.clientname,
        clientPhone: body.clientPhone,
        type: 'location',
        content: messageLocationContent,
      },
      messageLocationContent,
    );

    const message =
      'Porfavor confirma con el boton de abajo que esta sea tu ubicación actual.';
    const buttonTemplate = this.builderTemplate.buildInteractiveButtonMessage(
      body.clientPhone,
      message,
      [{ id: `${ctx.lat},${ctx.lng}`, title: 'Confirmar ubicación' }],
    );

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientName: ctx.clientname,
        clientPhone: body.clientPhone,
        type: 'interactive',
        content: message,
      },
      message,
    );

    await this.senderService.sendMessages(buttonTemplate, body.chatBotNumber);

    template = this.builderTemplate.buildTextMessage(
      body.clientPhone,
      isOtherLocationMessage,
    );

    await this.senderService.sendMessages(template, body.chatBotNumber);

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: body.chatBotNumber,
        clientPhone: body.clientPhone,
        content: template,
        type: 'text',
        clientName: '',
      },
      template.text.body,
    );
  }

  async sendAcceptVoucherWithPreviusLocation(
    body: ResponseToVoucherDto,
    ctx: Ctx,
    messageContent: string,
  ) {
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
  }
}
