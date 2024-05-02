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
    this.ctxService.updateCtx(ctx._id, ctx);
    await this.senderService.sendMessages(
      this.builderTemplate.buildLocationMessage(
        process.env.PHONE_ADMIN,
        longitude,
        latitude,
      ),
    );
    setTimeout(async () => {
      await this.senderService.sendMessages(
        this.builderTemplate.buildInteractiveButtonMessage(
          process.env.PHONE_ADMIN,
          `Ubicación cliente ${messageEntry.clientPhone}`,
          [
            {
              id: `Avisar`,
              title: 'Avisar repartidores',
            },
          ],
        ),
      );
    }, 1000);
    // send to client
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
      );
    }
  }

  async analyzeDataFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
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
        await this.sendInfoFlow(ctx, messageEntry, historyParsed);
      } else if (response === 'ORDENAR') {
        Logger.log('ORDERNAR', 'INTENCION');
        await this.sendPayLink(ctx, messageEntry, historyParsed);
      } else {
        Logger.log('COBERTURA', 'INTENCION');
        this.sendCoverageInfo(ctx, messageEntry, historyParsed);
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
      );
      let message = '';
      if (orderStatus === ORDER_STATUS.JUST_CREATED) {
        message = 'Estamos analizando tu pedido';
      } else if (orderStatus === ORDER_STATUS.ACEPTED_BY_ADMIN) {
        message = 'Estamos preparando tu pedido';
      } else if (orderStatus === ORDER_STATUS.ACCEPTED) {
        message = 'Estamos preparando tu pedido';
      } else if (orderStatus === ORDER_STATUS.PREPARED_BY_RESTAURANT) {
        message = 'Tu pedido esta preparado';
      } else if (orderStatus === ORDER_STATUS.PICKED_UP) {
        message = 'Tu pedido ha sido entregado';
      } else if (orderStatus === ORDER_STATUS.DELIVERED) {
        message = 'Tu pedido esta siendo enviado';
      } else if (orderStatus === ORDER_STATUS.REJECTED_BY_ADMIN) {
        message = 'Tu pedido ha sido cancelado';
      } else if (orderStatus === ORDER_STATUS.REJECTED_BY_RESTAURANT) {
        message = 'Tu pedido ha sido cancelado';
      } else if (orderStatus === ORDER_STATUS.CLOSED) {
        message = 'Tu pedido esta cerrado';
      } else {
        message = 'No has hecho ningun pedido';
      }
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          message,
        ),
      );
    } catch (error) {}
  }

  async declinePay(messageEntry: IParsedMessage) {
    const clientNumberPhone = messageEntry.content.id.split(' ')[3];
    const response = await this.aiService.createChat([
      {
        role: 'system',
        content: PROMPT_DECLINE_PAY,
      },
    ]);
    const chunks = response.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
      const newMessage = await this.historyService.setAndCreateAssitantMessage(
        messageEntry,
        chunk,
      );
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(clientNumberPhone, chunk),
      );
    }
  }

  async acceptPay(messageEntry: IParsedMessage) {
    const clientPhone: string = messageEntry.content.id.split(' ')[2];
    const ctx = await this.ctxService.findOrCreateCtx({
      clientPhone: clientPhone,
    });
    ctx.step = STEPS.WAITING_LOCATION;
    await this.ctxService.updateCtx(ctx._id, ctx);
    const response = await this.aiService.createChat([
      {
        role: 'system',
        content: PROMPT_ACCEPT_PAY,
      },
    ]);
    const chunks = response.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
      const newMessage = await this.historyService.setAndCreateAssitantMessage(
        messageEntry,
        chunk,
      );
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(clientPhone, chunk),
      );
    }
  }

  async checkPayFlow(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
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
        );
      }
      // send message about the pay to the admin
      await this.senderService.sendMessages(
        this.builderTemplate.buildMultimediaMessage(
          process.env.PHONE_ADMIN,
          'image',
          { link: cloudinaryImageUrl.url },
        ),
      );
      setTimeout(async () => {
        await this.senderService.sendMessages(
          this.builderTemplate.buildInteractiveButtonMessage(
            process.env.PHONE_ADMIN,
            'Comprobante de pago',
            [
              {
                id: `Confirmar pedido ${messageEntry.clientPhone}`,
                title: 'Confirmar',
              },
              {
                id: `Rechazar pedido ${messageEntry.clientPhone}`,
                title: 'Rechazar',
              },
            ],
          ),
        );
      }, 1000);

      // Actualizar paso
      ctx.step = STEPS.PRE_PAY;
      await this.ctxService.updateCtx(ctx._id, ctx);
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }

  async generatePrePayConfirmation(question: string, history: string) {
    const mainPrompt = PROMPT_PRE_PAY_CONFIRMATION.replace(
      '{chatHistory}',
      history,
    ).replace('{restaurante}', 'La Burguesía');
    return mainPrompt;
  }

  async sendPayLink(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
  ) {
    try {
      ctx.order = messageEntry.content.split(' ')[3].replace('*', '');
      this.ctxService.updateCtx(ctx._id, ctx);
      const prompt = await this.generatePayLink(
        messageEntry.content,
        historyParsed,
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

  async generatePayLink(question: string, history: string) {
    const mainPrompt = PROMPT_PAY_LINK.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace('{restaurante}', 'La Burguesía')
      .replace('{payLink}', 'https://linkdepagodummy.com/laburguesia');
    return mainPrompt;
  }

  async sendCoverageInfo(
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
  ) {
    try {
      const prompt = await this.generateGeneralCovergaInfo(
        messageEntry.content,
        historyParsed,
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

  async generateGeneralCovergaInfo(question: string, history: string) {
    const mainPrompt = PROMPT_COVERAGE.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace('{restaurante}', 'La Burguesía')
      .replace('{direccion}', 'Los Cardos 123, Urb. Miraflores,Piura')
      .replace('{link}', 'https://menu.cartadirecta.com/laburguesia');
    return mainPrompt;
  }

  async generateGeneralInfoFlow(question: string, history: string) {
    const menu = await this.businessService.parseMenuFromApiResponse();
    const mainPrompt = PROMPT_INFO.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace('{restaurante}', 'La Burguesía')
      .replace(
        '{slogan}',
        'Regla #1 Contarle a tus amigos del sabor de La Burguesía',
      )
      .replace('{direccion}', 'Los Cardos 123, Urb. Miraflores,Piura')
      .replace('{horarios}', 'Lunes a Sábados de 7 pm a 11pm')
      .replace('{link}', 'https://menu.cartadirecta.com/laburguesia')
      .replace('{extra}', menu.extras)
      .replace('{menu}', menu.comidas)
      .replace('{drinks}', menu.bebidas);
    return mainPrompt;
  }

  sendInfoFlow = async (
    ctx: Ctx,
    messageEntry: IParsedMessage,
    historyParsed: string,
  ) => {
    try {
      const prompt = await this.generateGeneralInfoFlow(
        messageEntry.content,
        historyParsed,
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
