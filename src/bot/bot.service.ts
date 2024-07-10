import { Injectable, Logger } from '@nestjs/common';
import { IParsedMessage } from './entities/messageParsed';
import { WspReceivedMessageDto } from 'src/common/dto';
import {
  INTERACTIVE_REPLIES_TYPES,
  WSP_MESSAGE_TYPES,
  STATUS_BOT,
} from 'src/common/constants';
import {
  receivedMessageDeliveryValidator,
  receivedMessageValidator,
} from './helpers/receivedMessageValidator';
import { FlowsService } from 'src/flows/flows.service';
import { CtxService } from 'src/context/ctx.service';
import { HistoryService } from 'src/history/history.service';
import { AiValidator } from './helpers/aiValidator';
import { AiService } from 'src/ai/ai.service';
import { WhatsappGateway } from 'src/wsp-web-gateway/wsp-web-gateway.gateway';
import { Ctx } from 'src/context/entities/ctx.entity';
import { any } from 'joi';
import { BusinessService } from 'src/business/business.service';
import { DeliveryService } from 'src/delivery/delivery.service';
import { Delivery } from 'src/delivery/entity';
import { parse } from 'path';

@Injectable()
export class BotService {
  constructor(
    private readonly flowsService: FlowsService,
    private readonly ctxService: CtxService,
    private readonly historyService: HistoryService,
    private readonly aiValidatorService: AiValidator,
    private aiService: AiService,
    private gatewayService: WhatsappGateway,
    private readonly deliveryService: DeliveryService,
    private readonly businessService: BusinessService,
  ) {}

  async proccessMessage(entryMessage: WspReceivedMessageDto) {
    // Deestructuración del mensaje de entrada
    Logger.log(`INIT PROCCESSMESSAGE  `, 'BOT SERVICE');
    const parsedMessage = await this.messageDestructurer(entryMessage);
    Logger.log(
      `PARSED MESSAGE  ${JSON.stringify(parsedMessage)} `,
      'BOT SERVICE',
    );

    //Si es otro tipo de mensaje
    if (parsedMessage === 'OKNO') {
      Logger.log(`NO CLIENT MESSAGE`, 'BOT SERVICE');
      return 'OK';
    }

    this.gatewayService.server.emit('newMessage');
    //Busca mensaje por número de cliente
    let ctx = await this.ctxService.findOrCreateCtx(parsedMessage);
    if (!ctx.clientname) {
      ctx.clientname = parsedMessage.clientName;
      await this.ctxService.updateCtx(ctx._id, ctx);
    }

    const lastMessage = await this.historyService.findLastMessage(
      parsedMessage.clientPhone,
      parsedMessage.chatbotNumber,
    );

    ctx.lastMessageDate = new Date();
    ctx.remindersCount = 0;
    ctx.seen = false;
    await this.ctxService.updateCtx(ctx._id, ctx);

    Logger.log(`CTX  ${JSON.stringify(ctx)} `, 'BOT SERVICE');
    const history = await this.historyService.createAndGetHistoryParsed(
      parsedMessage,
    );

    if (parsedMessage.type === 'text') {
      ctx = await this.waitingNewMessages(ctx, parsedMessage);
      if (!ctx) {
        return;
      }
      parsedMessage.content = ctx.messageSequence;
      ctx.messageSequence = '';
      await this.ctxService.updateCtx(ctx._id, ctx);
    }

    /* Verifica si el numero es de un delivery */
    const delivery = await this.deliveryService.findOne({
      chatbotNumber: parsedMessage.chatbotNumber,
      deliveryNumber: parsedMessage.clientPhone,
    });
    if (delivery) {
      this.deliveryNumbManage(ctx, parsedMessage, delivery);
      return;
    }

    const globalContext = await this.ctxService.findOrCreateCtx({
      clientPhone: parsedMessage.chatbotNumber,
      chatbotNumber: parsedMessage.chatbotNumber,
    });
    if (globalContext.statusBot === STATUS_BOT.OFF) {
      return 'OK';
    } else if (ctx.statusBot === STATUS_BOT.OFF) {
      return 'OK';
    }

    const businessInfo = await this.businessService.getBusiness(
      parsedMessage.chatbotNumber,
    );

    const action = receivedMessageValidator(ctx, parsedMessage, lastMessage);
    Logger.log(`THE ACTION IS: ${action} `, 'BOT SERVICE');

    await this.flowsService[action](ctx, parsedMessage, history, businessInfo);
    Logger.log(`THE FLOW : ${action} WAS EXCUTED`, 'BOT SERVICE');

    return 'OK';
  }

  private async deliveryNumbManage(
    ctxDelivery: Ctx,
    parsedMessage: IParsedMessage,
    delivery: Delivery,
  ) {
    const action = receivedMessageDeliveryValidator(
      ctxDelivery,
      parsedMessage,
      delivery,
    );
    if (action) {
      await this.flowsService[action](ctxDelivery, parsedMessage, delivery);
    }
  }

  private async messageDestructurer(messageDto: WspReceivedMessageDto) {
    const parsedMessage: IParsedMessage = {
      chatbotNumber: '',
      clientName: '',
      clientPhone: '',
      type: '',
      content: {},
    };
    if (
      messageDto.entry[0].changes[0].value?.statuses &&
      messageDto.entry[0].changes[0].value?.statuses[0].status
    ) {
      Logger.log(
        'STATUS',
        messageDto.entry[0].changes[0].value?.statuses[0].status,
      );
      return 'OKNO';
    }
    const chatbotNumber =
      messageDto.entry[0].changes[0].value.metadata.display_phone_number;
    const contact = messageDto.entry[0].changes[0].value.contacts[0];
    const message = messageDto.entry[0].changes[0].value.messages[0];

    parsedMessage.clientName = contact.profile.name;
    parsedMessage.clientPhone = contact.wa_id.startsWith('52')
      ? contact.wa_id.replace('521', '52')
      : contact.wa_id;
    parsedMessage.type = message.type;
    parsedMessage.chatbotNumber = chatbotNumber;
    // Falta agregar VIDEO y AUDIO
    // Falta agregar UNKNOW , EMOJIS , REACCIONES , STICKERS
    // Falta agregar LOCATION y CONTACT
    // Gestionar respuesta de estados del
    switch (message.type) {
      case WSP_MESSAGE_TYPES.INTERACTIVE:
        const interactiveType = message.interactive.type;
        if (interactiveType === INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY) {
          parsedMessage.content = {
            title:
              message.interactive[INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY].title,
            id: message.interactive[INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY].id,
          };

          break;
        } else if (interactiveType === INTERACTIVE_REPLIES_TYPES.LIST_REPLY) {
          parsedMessage.content = {
            title:
              message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].title,
            id: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].id,
            description:
              message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY]
                .description,
          };
        }
        break;
      case WSP_MESSAGE_TYPES.BUTTON:
        parsedMessage.content = {
          title: message.button.text,
          id: message.button.payload,
        };

        break;
      case WSP_MESSAGE_TYPES.TEXT:
        parsedMessage.content = message.text.body;
        break;
      case WSP_MESSAGE_TYPES.IMAGE:
        parsedMessage.content = message.image.id;
        break;
      case WSP_MESSAGE_TYPES.LOCATION:
        parsedMessage.content = `${message.location.latitude},${message.location.longitude}`;
        break;
      default:
        parsedMessage.content = message.type;
        return parsedMessage;
    }

    return parsedMessage;
  }

  async waitingNewMessages(ctx: Ctx, parsedMessage: IParsedMessage) {
    if (ctx.messageSequence !== '') {
      ctx.messageSequence = ctx.messageSequence + ', ' + parsedMessage.content;
    } else {
      ctx.messageSequence = ctx.messageSequence + parsedMessage.content;
    }
    await this.ctxService.updateCtx(ctx._id, ctx);
    const messageDelayMillisecond = parseInt(
      process.env.MESSAGE_DELAY_MILLISECONDS,
    );
    await new Promise((resolve) =>
      setTimeout(resolve, messageDelayMillisecond),
    );
    const actualCtx = await this.ctxService.findOrCreateCtx({
      clientPhone: parsedMessage.clientPhone,
      chatbotNumber: parsedMessage.chatbotNumber,
    });

    if (ctx.messageSequence === actualCtx.messageSequence) {
      return ctx;
    } else {
      return null;
    }
  }
  /* async analyzeMessage(ctx: Ctx, historyParsed: any) {
    console.log('HISTORY PARSED', historyParsed);
    const prompt =
      `Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación y determinar cuál de las siguientes acciones es más apropiada para realizar:
      --------------------------------------------------------
      Historial de conversación:
      {HISTORY}
      
      Posibles acciones a realizar:
      1. AGENDAR: Esta acción se debe realizar cuando el cliente expresa su deseo de programar una cita.
      2. HABLAR: Esta acción se debe realizar cuando el cliente desea hacer una pregunta o necesita más información.
      3. CONFIRMAR: Esta acción se debe realizar cuando el cliente confirma la hora y fecha de la cita despues de haberle brindado las opciones disponibles.
      -----------------------------
      Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
      
      Respuesta ideal (AGENDAR|HABLAR|CONFIRMAR):`.replace(
        '{HISTORY}',
        historyParsed,
      );

    try {
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      return response;
    } catch (err) {
      console.error(err);
      return 'ERROR';
    }
  } */
}
