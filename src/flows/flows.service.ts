import { Injectable, Logger } from '@nestjs/common';
import {
  DELIVERIES_STATUS,
  HELP_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_BOT,
  PAYMENT_TYPE,
  STATUS_BOT,
} from 'src/common/constants';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { CtxService } from 'src/context/ctx.service';
import { HistoryService } from 'src/history/history.service';
import { SenderService } from 'src/sender/sender.service';
import { AiService } from 'src/ai/ai.service';
import { Ctx } from 'src/context/entities/ctx.entity';
import { IParsedMessage } from 'src/builder-templates/interface';
import { STEPS } from 'src/context/helpers/constants';
import { BusinessService } from 'src/business/business.service';
import { GeneralServicesService } from 'src/general-services/general-services.service';
import {
  PROMPT_ANALYZE_DATA,
  PROMPT_PAY_LINK,
  PROMPT_PRE_PAY_CONFIRMATION,
  PROMPT_LOCATION,
  PROMPT_HELP,
  PROMPT_INFO_WITH_ORDER,
  PROMPT_MESSAGE_CONTAINTS_GREETINGS,
  PROMPT_INFO_WITH_GREETINGS,
  PROMPT_INFO_WITHOUT_GREETINGS,
  PROMPT_COVERAGE_WITH_GREETINGS,
  PROMPT_COVERAGE_WITHOUT_GREETINGS,
  PROMPT_LOCATION_WITHOUT_ADRRESS,
  PROMPT_MESSAGE_CONTAINTS_ADDRESS,
} from './Utils/prompts';
import { filterOrderId } from './Utils/filterOrderId';
import { CartaDirectaService } from 'src/carta-directa/cartaDirecta.service';
import { statusOrderMessageList } from './Utils/orderStatusMessages';
import {
  confirmDeliveryMessage,
  invalidMessageFormatMessage,
  noVoucherPaymentMethodMessage,
  paymentMethodMessage,
  reminderLocationMessage,
  reminderVoucherMessage,
  responseConfirmDeliveryByClientMessage,
  userOverFlowMessage,
} from './Utils/messages';
import { splitArray } from './Utils/splitArray';
import { Business } from 'src/business/entity';
import { Delivery } from 'src/delivery/entity';
import { parseRestaurantHours } from './Utils/parseRestaurantHours';
import { DeliveryService } from 'src/delivery/delivery.service';
import { WhatsappGateway } from 'src/wsp-web-gateway/wsp-web-gateway.gateway';
import { UiResponsesService } from 'src/UiResponses/UiResponses.service';
import { measureMemory } from 'vm';

@Injectable()
export class FlowsService {
  constructor(
    private readonly businessService: BusinessService,
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly ctxService: CtxService,
    private readonly historyService: HistoryService,
    private readonly senderService: SenderService,
    private readonly aiService: AiService,
    private readonly generalService: GeneralServicesService,
    private readonly cartaDirectaService: CartaDirectaService,
    private readonly deliveryService: DeliveryService,
    private readonly uiResponseService: UiResponsesService,
    private gatewayService: WhatsappGateway,
  ) {}

  async locationFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
  ) {
    const locationSplit = messageEntry.content.split(',');
    const latitude = parseFloat(locationSplit[0]);
    const longitude = parseFloat(locationSplit[1]);
    // add latitude and longitude to ctx
    const clientDontHasAddress = ctx.address.split(', ')[1] === 'null';
    let prompt: string;
    if (clientDontHasAddress) {
      ctx.step = STEPS.WAITING_ADDRESS_OR_REF;
      prompt = PROMPT_LOCATION_WITHOUT_ADRRESS;
    } else {
      ctx.step = STEPS.ORDERED;
      prompt = PROMPT_LOCATION;
    }
    ctx.lat = latitude.toString();
    ctx.lng = longitude.toString();
    this.ctxService.updateCtx(ctx._id, ctx);
    // send to client
    messageEntry.type = 'text';
    const response = await this.aiService.createChat([
      {
        role: 'system',
        content: prompt,
      },
    ]);
    const chunks = response.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
      const newMessage = await this.historyService.setAndCreateAssitantMessage(
        messageEntry,
        chunk,
      );
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(messageEntry.clientPhone, chunk),
        messageEntry.chatbotNumber,
      );
    }
  }

  async analyzeDataFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    try {
      Logger.log('DEFINO INTENCION DEL CLIENTE', 'ANALYZE_PROMPT');
      let response = '';
      if (messageEntry.content.includes('Número de orden:')) {
        response = 'ORDENAR';
      } else {
        const prompt = this.generateAnalyzePrompt(
          messageEntry.content,
          historyParsed,
        );
        response = await this.aiService.createChat([
          {
            role: 'system',
            content: prompt,
          },
        ]);
      }
      if (response === 'INFO') {
        Logger.log('INFO', 'INTENCION');
        await this.sendInfoFlow(ctx, messageEntry, historyParsed, businessInfo);
      } else if (response === 'ORDENAR') {
        Logger.log('ORDERNAR', 'INTENCION');
        await this.sendPaymentMethods(
          ctx,
          messageEntry,
          historyParsed,
          businessInfo,
        );
      } else if (response === 'COBERTURA') {
        Logger.log('COBERTURA', 'INTENCION');
        this.sendCoverageInfo(ctx, messageEntry, historyParsed, businessInfo);
      } else {
        Logger.log('INFO', 'INTENCION');
        await this.sendInfoFlow(ctx, messageEntry, historyParsed, businessInfo);
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async sendCatchAdressFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    history: string,
    businessInfo,
  ) {
    const splitedAdress = ctx.address.split(', ');
    splitedAdress[1] = ', ' + messageEntry.content;
    const joinedAdress = splitedAdress.join('');
    const prompt = PROMPT_MESSAGE_CONTAINTS_ADDRESS.replace(
      '{MENSAJE}',
      messageEntry.content,
    );
    const response = await this.aiService.createChat([
      {
        role: 'system',
        content: prompt,
      },
    ]);
    console.log(response);
    let message: string;
    if (response === 'SI') {
      ctx.address = joinedAdress;
      ctx.step = STEPS.ORDERED;
      await this.ctxService.updateCtx(ctx._id, ctx);
      message =
        'Gracias por enviarnos tu dirección tu pedido esta en preparación. 😊';
    } else {
      message = 'Porfavor envianos una dirección valida. 😊';
    }
    const template = this.builderTemplate.buildTextMessage(
      messageEntry.clientPhone,
      message,
    );
    await this.senderService.sendMessages(template, messageEntry.chatbotNumber);
    await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      message,
    );
  }

  async sendPaymentMethods(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    history: string,
    businessInfo,
  ) {
    const orderId = messageEntry.content.split(' ')[3].replace('*', '');
    ctx.currentOrderId = filterOrderId(orderId);

    ctx = await this.cartaDirectaService.parseCtxWithOrderInfo(
      ctx,
      ctx.chatbotNumber,
    );

    ctx.orderStatus = 1;
    ctx.step = STEPS.SELECT_PAY_METHOD;
    ctx.voucherUrl = '';
    this.ctxService.updateCtx(ctx._id, ctx);
    const aviablePaymentMethods = businessInfo.paymentMethods.filter(
      (method) => {
        return method.available;
      },
    );
    const rows = aviablePaymentMethods.map((e) => {
      return {
        id: e.paymentMethodName,
        title: e.paymentMethodName,
      };
    });
    const template = await this.builderTemplate.buildInteractiveListMessage(
      messageEntry.clientPhone,
      'Elegir metodo',
      [
        {
          title: 'Sección 1',
          rows,
        },
      ],
      'Selecciona tu metodo de pago',
      'Muchas gracias por elegirnos 😊',
      '‎ ',
    );
    await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      'Selecciona tu metodo de pago',
    );
    await this.senderService.sendMessages(template, messageEntry.chatbotNumber);
  }

  async invalidPayMethodFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    history: string,
    businessInfo,
  ) {
    const message = 'Porfavor selecciona un metodo de pago valido';
    const template = this.builderTemplate.buildTextMessage(
      messageEntry.clientPhone,
      message,
    );
    await this.senderService.sendMessages(template, messageEntry.chatbotNumber);
    await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      message,
    );
    await this.sendPaymentMethods(ctx, messageEntry, history, businessInfo);
  }

  async orderStateFlow(ctx: Ctx, messageEntry: IParsedMessage) {
    try {
      let message = '';
      message = statusOrderMessageList[ctx.orderStatus];

      ctx = await this.cartaDirectaService.parseCtxWithOrderInfo(
        ctx,
        ctx.chatbotNumber,
      );
      await this.ctxService.updateCtx(ctx._id, ctx);
      const newMessage = await this.historyService.setAndCreateAssitantMessage(
        messageEntry,
        message,
      );
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          message,
        ),
        messageEntry.chatbotNumber,
      );
    } catch (error) {}
  }

  async sendHelpFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    ctx.help = HELP_STATUS.ON;
    ctx.statusBot = STATUS_BOT.OFF;
    await this.ctxService.updateCtx(ctx._id, ctx);
    const prompt = PROMPT_HELP;
    const response = await this.aiService.createChat([
      {
        role: 'system',
        content: prompt,
      },
    ]);
    const chunks = response.split(/(?<!\d)\.\s+/g);
    messageEntry.type = 'text';
    for (const chunk of chunks) {
      const newMessage = await this.historyService.setAndCreateAssitantMessage(
        messageEntry,
        chunk,
      );
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(messageEntry.clientPhone, chunk),
        messageEntry.chatbotNumber,
      );
    }
  }

  async checkPayFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    try {
      const prompt = await this.generatePrePayConfirmation(
        messageEntry.content,
        historyParsed,
        businessInfo,
        messageEntry,
      );
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      ctx.voucherUrl = messageEntry.content;
      ctx.orderStatus = ORDER_STATUS_BOT.orden_con_pago;
      ctx.step = STEPS.PRE_PAY;
      await this.ctxService.updateCtx(ctx._id, ctx);
      const chunks = response.split(/(?<!\d)\.\s+/g);
      messageEntry.type = 'text';
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
          messageEntry.chatbotNumber,
        );
      }
      this.gatewayService.server.emit('newMessage');
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async generatePrePayConfirmation(
    question: string,
    history: string,
    businessInfo,
    messageEntry: IParsedMessage,
  ) {
    const mainPrompt = PROMPT_PRE_PAY_CONFIRMATION.replace(
      '{chatHistory}',
      history,
    ).replace(/{restaurante}/g, businessInfo.businessName);
    return mainPrompt;
  }

  async sendPayFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    ctx.paymentMethod = messageEntry.content;
    const paymentMethodSelected = businessInfo.paymentMethods.find(
      (paymentMethod) => {
        return paymentMethod.paymentMethodName === messageEntry.content;
      },
    );
    ctx.paymentType = paymentMethodSelected.type;
    try {
      messageEntry.type = 'text';
      if (paymentMethodSelected.type === PAYMENT_TYPE.no_voucher) {
        await this.uiResponseService.responseToVoucher({
          chatBotNumber: messageEntry.chatbotNumber,
          clientPhone: messageEntry.clientPhone,
          orderId: ctx.currentOrderId,
          action: 1,
        });
        const newCtx = await this.ctxService.findOrCreateCtx({
          clientPhone: messageEntry.clientPhone,
          chatbotNumber: messageEntry.chatbotNumber,
        });
        newCtx.paymentType = paymentMethodSelected.type;
        newCtx.paymentMethod = messageEntry.content;
        await this.ctxService.updateCtx(newCtx._id, newCtx);
      } else {
        ctx.step = STEPS.PRE_PAY;
        await this.ctxService.updateCtx(ctx._id, ctx);
        let message = paymentMethodMessage(
          paymentMethodSelected.paymentMethodName,
          paymentMethodSelected.accountNumber,
          paymentMethodSelected.accountName,
        );
        let template = await this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          message,
        );
        await this.senderService.sendMessages(
          template,
          messageEntry.chatbotNumber,
        );
        await this.historyService.setAndCreateAssitantMessage(
          messageEntry,
          message,
        );
        message = reminderVoucherMessage;
        template = await this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          message,
        );
        await this.senderService.sendMessages(
          template,
          messageEntry.chatbotNumber,
        );
        await this.historyService.setAndCreateAssitantMessage(
          messageEntry,
          message,
        );
      }

      this.gatewayService.server.emit('newMessage');
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async efectivePayFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    const message = noVoucherPaymentMethodMessage(ctx.paymentMethod);
    const template = await this.builderTemplate.buildTextMessage(
      messageEntry.clientPhone,
      message,
    );
    await this.senderService.sendMessages(template, messageEntry.chatbotNumber);
    await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      message,
    );
  }

  async generatePayLink(
    question: string,
    history: string,
    businessInfo,
    messageEntry: IParsedMessage,
  ) {
    const mainPrompt = PROMPT_PAY_LINK.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace('{payLink}', 'https://linkdepagodummy.com/laburguesia');
    return mainPrompt;
  }

  async sendCoverageInfo(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    try {
      const prompt = await this.generateGeneralCovergaInfo(
        messageEntry.content,
        historyParsed,
        businessInfo,
        messageEntry,
      );
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      const chunks = response.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
          messageEntry.chatbotNumber,
        );
      }
      let reminderMessage = '';
      const paymentMethodSelected = businessInfo.paymentMethods.find(
        (paymentMethod) => {
          return paymentMethod.paymentMethodName === ctx.paymentMethod;
        },
      );
      if (
        ctx.step === STEPS.PRE_PAY &&
        paymentMethodSelected === PAYMENT_TYPE.veoucher
      ) {
        reminderMessage = reminderVoucherMessage;
      } else if (ctx.step === STEPS.WAITING_LOCATION) {
        reminderMessage = reminderLocationMessage;
      }
      if (reminderMessage !== '') {
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            reminderMessage,
          ),
          messageEntry.chatbotNumber,
        );
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async generateGeneralCovergaInfo(
    question: string,
    history: string,
    businessInfo: Business,
    messageEntry: IParsedMessage,
  ) {
    const splitStory = history.split(/Cliente:|Vendedor:/);
    const messageContaintsGreetings = await this.aiService.createChat([
      {
        role: 'system',
        content: PROMPT_MESSAGE_CONTAINTS_GREETINGS.replace(
          '{MENSAJE}',
          splitStory[splitStory.length - 1],
        ),
      },
    ]);
    let selectedPrompt: string;
    if (messageContaintsGreetings === 'SI') {
      selectedPrompt = PROMPT_COVERAGE_WITH_GREETINGS;
    } else {
      selectedPrompt = PROMPT_COVERAGE_WITHOUT_GREETINGS;
    }

    const mainPrompt = selectedPrompt
      .replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace('{direccion}', businessInfo.address)
      .replace('{coverage}', JSON.stringify(businessInfo.coverage))
      .replace(
        '{link}',
        `https://menu.cartadirecta.com/restaurant/${businessInfo.businessName}`,
      );
    return mainPrompt;
  }

  async generateGeneralInfoFlow(
    question: string,
    history: string,
    businessInfo,
    messageEntry: IParsedMessage,
  ) {
    const menu = await this.cartaDirectaService.parseMenuFromApiResponse(
      businessInfo.businessId,
      question,
    );

    const splitStory = history.split(/Cliente:|Vendedor:/);
    const messageContaintsGreetings = await this.aiService.createChat([
      {
        role: 'system',
        content: PROMPT_MESSAGE_CONTAINTS_GREETINGS.replace(
          '{MENSAJE}',
          splitStory[splitStory.length - 1],
        ),
      },
    ]);
    let selectedPrompt: string;
    if (messageContaintsGreetings === 'SI') {
      selectedPrompt = PROMPT_INFO_WITH_GREETINGS;
    } else {
      selectedPrompt = PROMPT_INFO_WITHOUT_GREETINGS;
    }

    const mainPrompt = selectedPrompt
      .replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{clientName}/g, messageEntry.clientName)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace('{direccion}', businessInfo.address)
      .replace(
        '{horarios}',
        JSON.stringify(parseRestaurantHours(businessInfo.businessHours)),
      )
      .replace(
        /{link}/g,
        `https://menu.cartadirecta.com/restaurant/${businessInfo.businessName}`,
      )
      .replace('{menu}', JSON.stringify(menu))
      .replace('{slogan}', businessInfo.slogan);
    return mainPrompt;
  }

  sendInfoFlow = async (
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) => {
    try {
      const prompt = await this.generateGeneralInfoFlow(
        messageEntry.content,
        historyParsed,
        businessInfo,
        messageEntry,
      );
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      const chunks = response.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
          messageEntry.chatbotNumber,
        );
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  };

  async generateGeneralInfoFlowWithOrder(
    question: string,
    history: string,
    businessInfo,
    messageEntry: IParsedMessage,
  ) {
    const menu = await this.cartaDirectaService.parseMenuFromApiResponse(
      businessInfo.businessId,
      question,
    );
    const mainPrompt = PROMPT_INFO_WITH_ORDER.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace(/{clientName}/g, messageEntry.clientName)
      .replace('{direccion}', businessInfo.address)
      .replace(
        '{horarios}',
        JSON.stringify(parseRestaurantHours(businessInfo.businessHours)),
      )
      .replace('{menu}', JSON.stringify(menu))
      .replace('{slogan}', businessInfo.slogan);
    return mainPrompt;
  }

  async clientConfirmDelivery(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    ctx.orderStatus = ORDER_STATUS_BOT.entregado;
    ctx.orders.push(ctx.currentOrderId);
    ctx.step = STEPS.INIT;
    ctx.voucherUrl = '';
    await this.ctxService.updateCtx(ctx._id, ctx);

    await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      responseConfirmDeliveryByClientMessage,
    );
    const template = await this.builderTemplate.buildTextMessage(
      messageEntry.clientPhone,
      responseConfirmDeliveryByClientMessage,
    );
    await this.senderService.sendMessages(template, messageEntry.chatbotNumber);
  }

  async deliveryConfirmOrder(
    ctxDelivery: Ctx,
    parsedMessage: IParsedMessage,
    delivery: Delivery,
  ) {
    const clientCtx = await this.ctxService.findOrCreateCtx({
      clientPhone: parsedMessage.content,
      chatbotNumber: parsedMessage.chatbotNumber,
    });

    await this.deliveryService.update({
      ...delivery,
      chatbotNumber: parsedMessage.chatbotNumber,
      deliveryNumber: delivery.deliveryNumber,
      status: DELIVERIES_STATUS.sin_orden,
      timeToRestaurant: null,
      note: null,
      currentOrderId: null,
      newDeliveryNumber: null,
    });

    clientCtx.deliveryConfirmationByDelivery = true;
    clientCtx.orderStatus = ORDER_STATUS_BOT.entregado;
    await this.ctxService.updateCtx(clientCtx._id, clientCtx);

    /* send request confirm delivery to the client */
    const buttonTemplate = this.builderTemplate.buildInteractiveButtonMessage(
      clientCtx.clientPhone,
      confirmDeliveryMessage,
      [{ id: 'confirm', title: 'Confirmar entrega' }],
    );

    await this.historyService.setAndCreateAssitantMessage(
      { ...parsedMessage, clientPhone: clientCtx.clientPhone },
      confirmDeliveryMessage,
    );

    await this.senderService.sendMessages(
      buttonTemplate,
      parsedMessage.chatbotNumber,
    );

    this.gatewayService.server.emit('newMessage');
  }

  sendInfoFlowWithOrder = async (
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) => {
    try {
      const prompt = await this.generateGeneralInfoFlowWithOrder(
        messageEntry.content,
        historyParsed,
        businessInfo,
        messageEntry,
      );
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      const chunks = response.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
          messageEntry.chatbotNumber,
        );
      }
      let reminderMessage = '';
      const paymentMethodSelected = businessInfo.paymentMethods.find(
        (paymentMethod) => {
          return paymentMethod.paymentMethodName === ctx.paymentMethod;
        },
      );
      if (ctx.step === STEPS.PRE_PAY && PAYMENT_TYPE.veoucher) {
        reminderMessage = reminderVoucherMessage;
      } else if (ctx.step === STEPS.WAITING_LOCATION) {
        reminderMessage = reminderLocationMessage;
      }
      if (reminderMessage !== '') {
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            reminderMessage,
          ),
          messageEntry.chatbotNumber,
        );
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  };

  generateAnalyzePrompt = (question: string, history: string) => {
    return PROMPT_ANALYZE_DATA.replace('{HISTORY}', history).replace(
      '{CLIENT_ANSWER}',
      question,
    );
  };

  async typeMessageIsInvalid(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    const templateMessage = this.builderTemplate.buildTextMessage(
      messageEntry.clientPhone,
      invalidMessageFormatMessage,
    );

    const newMessage = await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      invalidMessageFormatMessage,
    );

    await this.senderService.sendMessages(
      templateMessage,
      messageEntry.chatbotNumber,
    );
  }

  async userOverFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    const templateMessage = this.builderTemplate.buildTextMessage(
      messageEntry.clientPhone,
      userOverFlowMessage,
    );

    const newMessage = await this.historyService.setAndCreateAssitantMessage(
      messageEntry,
      userOverFlowMessage,
    );

    await this.senderService.sendMessages(
      templateMessage,
      messageEntry.chatbotNumber,
    );
  }
}
