import { Injectable, Logger } from '@nestjs/common';
import { HELP_STATUS, ORDER_STATUS, STATUS_BOT } from 'src/common/constants';
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
  PROMPT_INFO,
  PROMPT_ANALYZE_DATA,
  PROMPT_COVERAGE,
  PROMPT_PAY_LINK,
  PROMPT_PRE_PAY_CONFIRMATION,
  PROMPT_LOCATION,
  PROMPT_HELP,
  PROMPT_INFO_WITH_ORDER,
} from './Utils/prompts';
import { filterOrderId } from './Utils/filterOrderId';
import { CartaDirectaService } from 'src/carta-directa/cartaDirecta.service';
import { statusOrderMessageList } from './Utils/orderStatusMessages';
import {
  efectivePaymentMethodMessage,
  paymentMethodMessage,
  reminderLocationMessage,
  reminderVoucherMessage,
} from './Utils/messages';
import { splitArray } from './Utils/splitArray';

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
  ) {}

  async locationFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
  ) {
    const locationSplit = messageEntry.content.split(',');
    const latitude = parseFloat(locationSplit[0]);
    const longitude = parseFloat(locationSplit[1]);
    // send to admin
    ctx.step = STEPS.ORDERED;
    ctx.lat = latitude.toString();
    ctx.lng = longitude.toString();
    this.ctxService.updateCtx(ctx._id, ctx);
    // send to client
    messageEntry.type = 'text';
    const response = await this.aiService.createChat([
      {
        role: 'system',
        content: PROMPT_LOCATION,
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
      console.log(businessInfo);
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

      // Actualizar paso
      ctx.step = STEPS.PRE_PAY;
      await this.ctxService.updateCtx(ctx._id, ctx);
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
    try {
      messageEntry.type = 'text';
      if (messageEntry.content === 'Efectivo') {
        await this.efectivePayFlow(
          ctx,
          messageEntry,
          historyParsed,
          businessInfo,
        );
      } else {
        const paymentMethodSelected = businessInfo.paymentMethods.find(
          (paymentMethod) => {
            return paymentMethod.paymentMethodName === messageEntry.content;
          },
        );
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

      ctx.step = STEPS.PRE_PAY;
      await this.ctxService.updateCtx(ctx._id, ctx);
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
    const message = efectivePaymentMethodMessage;
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
      if (ctx.step === STEPS.PRE_PAY && ctx.paymentMethod !== 'Efectivo') {
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
    businessInfo,
    messageEntry: IParsedMessage,
  ) {
    const mainPrompt = PROMPT_COVERAGE.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace('{direccion}', businessInfo.address)
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
    const mainPrompt = PROMPT_INFO.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{clientName}/g, messageEntry.clientName)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace('{direccion}', businessInfo.address)
      .replace('{horarios}', businessInfo.businessHours[0])
      .replace(
        /{link}/g,
        `https://menu.cartadirecta.com/restaurant/${businessInfo.businessName}`,
      )
      .replace('{menu}', JSON.stringify(menu))
      .replace('{slogan}', businessInfo.slogan);
    console.log(mainPrompt);
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
      .replace('{horarios}', businessInfo.businessHours[0])
      .replace('{menu}', JSON.stringify(menu))
      .replace('{slogan}', businessInfo.slogan);
    console.log(mainPrompt);
    return mainPrompt;
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
      if (ctx.step === STEPS.PRE_PAY && ctx.paymentMethod !== 'Efectivo') {
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
}
