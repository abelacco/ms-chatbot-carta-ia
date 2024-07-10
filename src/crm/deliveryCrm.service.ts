import { Injectable } from '@nestjs/common';
import { CtxService } from 'src/context/ctx.service';
import { isTimeDifferenceGreater } from './utils/utils';
import { Delivery } from 'src/delivery/entity';
import { HistoryService } from 'src/history/history.service';
import { SenderService } from 'src/sender/sender.service';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { CrmService } from './crm.service';

@Injectable()
export class DeliveryCrmService {
  constructor(
    private readonly ctxService: CtxService,
    private readonly historyService: HistoryService,
    private readonly senderService: SenderService,
    private readonly builderTemplateService: BuilderTemplatesService,
    private readonly crmService: CrmService,
  ) {}

  async deliveriesWorkToday(deliveries: Delivery[]) {
    for (const delivery of deliveries) {
      const lastMessage: any = await this.historyService.findLastMessage(
        delivery.deliveryNumber,
        delivery.chatbotNumber,
        true,
      );

      const deliveryCtx = await this.ctxService.findOrCreateCtx({
        clientPhone: delivery.deliveryNumber,
        chatbotNumber: delivery.chatbotNumber,
      });
      if (isTimeDifferenceGreater(lastMessage.createdAt, new Date(), 1440)) {
        /* await this.crmService.sendButtonMessage({
          chatbotNumber: deliveryCtx.chatbotNumber,
          clientPhone: deliveryCtx.clientPhone,
          templateName: 'deliveries_works',
          bodyVariables: ['Buenas'],
          buttonsPayload: ['Sí, si trabajo', 'No, no trabajo'],
        });
        await this.historyService.setAndCreateAssitantMessage(
          {
            chatbotNumber: deliveryCtx.chatbotNumber,
            clientName: deliveryCtx.clientname,
            clientPhone: deliveryCtx.clientPhone,
            type: 'button',
            content: 'Buenas, hoy trabajas?\nPorfavor confirma con los botones',
          },
          'Buenas, hoy trabajas?\nPorfavor confirma con los botones',
        );
         */
      } else {
        /*  const buttonTemplate =
          this.builderTemplateService.buildInteractiveButtonMessage(
            deliveryCtx.clientPhone,
            'Buenas, hoy trabajas?\nPorfavor confirma con los botones',
            [
              { id: 'Sí, si trabajo', title: 'Sí, si trabajo' },
              { id: 'No, no trabajo', title: 'No, no trabajo' },
            ],
          );
        await this.senderService.sendMessages(
          buttonTemplate,
          deliveryCtx.chatbotNumber,
          true,
        );
        await this.historyService.setAndCreateAssitantMessage(
          {
            chatbotNumber: deliveryCtx.chatbotNumber,
            clientName: deliveryCtx.clientname,
            clientPhone: deliveryCtx.clientPhone,
            type: buttonTemplate.type,
            content: 'Buenas, hoy trabajas?\nPorfavor confirma con los botones',
          },
          'Buenas, hoy trabajas?\nPorfavor confirma con los botones',
        ); */
      }
    }
  }
}
