import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { SenderService } from 'src/sender/sender.service';
import { CtxService } from 'src/context/ctx.service';
import { BusinessService } from 'src/business/business.service';
import { STEPS } from 'src/context/helpers/constants';
import { isTimeDifferenceGreater } from './utils/utils';
import { HistoryService } from 'src/history/history.service';

@Injectable()
export class ReminderService {
  constructor(
    private readonly builderTemplateService: BuilderTemplatesService,
    private readonly senderService: SenderService,
    private readonly ctxService: CtxService,
    private readonly businessService: BusinessService,
    private readonly historyService: HistoryService,
  ) {}

  async reminderPaymentMethod() {
    const ctxes = await this.ctxService.getCtxesByChatbotNumber(undefined, {
      startDate: undefined,
      endDate: undefined,
      step: STEPS.SELECT_PAY_METHOD,
    });
    for (const ctx of ctxes) {
      if (
        isTimeDifferenceGreater(ctx.lastMessageDate, new Date(), 5) &&
        ctx.remindersCount < 2
      ) {
        ctx.remindersCount = ctx.remindersCount + 1;
        ctx.lastMessageDate = new Date();
        await this.ctxService.updateCtx(ctx._id, ctx);
        const business = await this.businessService.getBusiness(
          ctx.chatbotNumber,
        );
        const aviablePaymentMethods = business.paymentMethods.filter(
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
        const template =
          this.builderTemplateService.buildInteractiveListMessage(
            ctx.clientPhone,
            'Elegir metodo',
            [
              {
                title: 'Sección 1',
                rows,
              },
            ],
            'Por favor no te olvides de seleccionar tu metodo de pago',
            'Muchas gracias por elegirnos 😊',
            '‎ ',
          );
        await this.senderService.sendMessages(
          template,
          ctx.chatbotNumber,
          true,
        );
        await this.historyService.setAndCreateAssitantMessage(
          {
            chatbotNumber: ctx.chatbotNumber,
            clientName: ctx.clientname,
            clientPhone: ctx.clientPhone,
            type: template.type,
            content: 'Por favor no te olvides de seleccionar tu metodo de pago',
          },
          'Por favor no te olvides de seleccionar tu metodo de pago',
        );
      }
    }
  }

  async reminderVoucher() {
    const ctxes = await this.ctxService.getCtxesByChatbotNumber(undefined, {
      startDate: undefined,
      endDate: undefined,
      step: STEPS.PRE_PAY,
    });
    for (const ctx of ctxes) {
      if (
        isTimeDifferenceGreater(ctx.lastMessageDate, new Date(), 5) &&
        ctx.remindersCount < 2 &&
        !ctx.voucherUrl
      ) {
        ctx.remindersCount = ctx.remindersCount + 1;
        ctx.lastMessageDate = new Date();
        await this.ctxService.updateCtx(ctx._id, ctx);
        const message = 'Recuerda enviarnos foto de tu comprobante de pago. 😊';
        const template = this.builderTemplateService.buildTextMessage(
          ctx.clientPhone,
          message,
        );
        await this.senderService.sendMessages(
          template,
          ctx.chatbotNumber,
          true,
        );
        await this.historyService.setAndCreateAssitantMessage(
          {
            chatbotNumber: ctx.chatbotNumber,
            clientName: ctx.clientname,
            clientPhone: ctx.clientPhone,
            type: template.type,
            content: 'Por favor no te olvides de seleccionar tu metodo de pago',
          },
          message,
        );
      }
    }
  }
}
