import { Injectable, Logger } from '@nestjs/common';
import { ORDER_STATUS } from 'src/common/constants';
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
  PROMPT_DECLINE_PAY,
  PROMPT_ACCEPT_PAY,
  PROMPT_LOCATION,
} from './Utils/promps';
import { string } from 'joi';
import { filterOrderId } from './Utils/filterOrderId';
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
        await this.sendPayLink(ctx, messageEntry, historyParsed, businessInfo);
      } else {
        Logger.log('COBERTURA', 'INTENCION');
        this.sendCoverageInfo(ctx, messageEntry, historyParsed, businessInfo);
      }
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async orderStateFlow(ctx: Ctx, messageEntry: IParsedMessage) {
    try {
      const orderStatus = await this.businessService.getOrderStatus(
        parseInt(ctx.order),
        messageEntry.chatbotNumber,
      );
      let message = '';
      let resetSteps = false;
      if (orderStatus === ORDER_STATUS.JUST_CREATED) {
        message = 'Estamos analizando tu pedido';
      } else if (orderStatus === ORDER_STATUS.ACEPTED_BY_ADMIN) {
        message = 'Estamos preparando tu pedido';
      } else if (orderStatus === ORDER_STATUS.ACCEPTED) {
        message = 'Estamos preparando tu pedido';
      } else if (orderStatus === ORDER_STATUS.PREPARED_BY_RESTAURANT) {
        message = 'Tu pedido esta preparado';
      } else if (orderStatus === ORDER_STATUS.PICKED_UP) {
        resetSteps = true;
        message = 'Tu pedido ha sido entregado';
      } else if (orderStatus === ORDER_STATUS.DELIVERED) {
        message = 'Tu pedido esta siendo enviado';
      } else if (orderStatus === ORDER_STATUS.REJECTED_BY_ADMIN) {
        resetSteps = true;
        message = 'Tu pedido ha sido cancelado';
      } else if (orderStatus === ORDER_STATUS.REJECTED_BY_RESTAURANT) {
        resetSteps = true;
        message = 'Tu pedido ha sido cancelado';
      } else if (orderStatus === ORDER_STATUS.CLOSED) {
        resetSteps = true;
        message = 'Tu pedido esta cerrado';
      } else {
        resetSteps = true;
        message = 'No has hecho ningun pedido';
      }

      ctx.orderStatus = orderStatus;
      if (resetSteps) {
        ctx.step = STEPS.INIT;
        delete ctx.order;
        delete ctx.orderStatus;
      }
      await this.ctxService.updateCtx(ctx._id, ctx);

      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          message,
        ),
        messageEntry.chatbotNumber,
      );
    } catch (error) {}
  }

  async checkPayFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    try {
      const wspImageUrl = await this.generalService.getWhatsappMediaUrl(
        messageEntry.content,
      );
      const cloudinaryImageUrl = await this.generalService.uploadFromURL(
        wspImageUrl,
      );
      const prompt = await this.generatePrePayConfirmation(
        messageEntry.content,
        historyParsed,
        businessInfo,
      );
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      ctx.voucherUrl = cloudinaryImageUrl.url;
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
  ) {
    const mainPrompt = PROMPT_PRE_PAY_CONFIRMATION.replace(
      '{chatHistory}',
      history,
    ).replace(/{restaurante}/g, businessInfo.businessName);
    return mainPrompt;
  }

  async sendPayLink(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
    businessInfo,
  ) {
    try {
      const orderId = messageEntry.content.split(' ')[3].replace('*', '');
      ctx.order = filterOrderId(orderId);
      this.ctxService.updateCtx(ctx._id, ctx);
      const prompt = await this.generatePayLink(
        messageEntry.content,
        historyParsed,
        businessInfo,
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
      // Actualizar paso
      ctx.step = STEPS.PRE_PAY;
      ctx.orderStatus = ORDER_STATUS.JUST_CREATED;
      await this.ctxService.updateCtx(ctx._id, ctx);
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async generatePayLink(question: string, history: string, businessInfo) {
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
      // Actualizar paso
      ctx.step = ctx.step;
      await this.ctxService.updateCtx(ctx._id, ctx);
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async generateGeneralCovergaInfo(
    question: string,
    history: string,
    businessInfo,
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
  ) {
    const menu = await this.businessService.parseMenuFromApiResponse(
      businessInfo.businessId,
    );
    const mainPrompt = PROMPT_INFO.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace(/{restaurante}/g, businessInfo.businessName)
      .replace('{direccion}', businessInfo.address)
      .replace('{horarios}', businessInfo.businessHours[0])
      .replace(
        '{link}',
        `https://menu.cartadirecta.com/restaurant/${businessInfo.businessName}`,
      )
      .replace('{extra}', menu.extras)
      .replace('{menu}', menu.comidas)
      .replace('{drinks}', menu.bebidas)
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
      // Actualizar paso
      ctx.step = ctx.step;
      await this.ctxService.updateCtx(ctx._id, ctx);
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
