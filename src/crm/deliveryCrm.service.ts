import { Injectable } from '@nestjs/common';
import { CtxService } from 'src/context/ctx.service';
import { isTimeDifferenceGreater } from './utils/utils';
import { Delivery } from 'src/delivery/entity';

@Injectable()
export class DeliveryCrmService {
  constructor(private readonly ctxService: CtxService) {}

  async deliveriesWorkToday(deliveries: Delivery[]) {
    for (const delivery of deliveries) {
      const deliveryCtx = await this.ctxService.findOrCreateCtx({
        clientPhone: delivery.deliveryNumber,
        chatbotNumber: delivery.chatbotNumber,
      });
      if (
        isTimeDifferenceGreater(deliveryCtx.lastMessageDate, new Date(), 1440)
      ) {
      } else {
        /* const buttonTemplate =
          this.builderTemplateService.buildInteractiveButtonMessage(
            deliveryCtx.clientPhone,
            'Buenas, hoy trabajas?\nPorfavor confirma con los botones',
            [
              { id: 'd', title: 'Sí, si trabajo' },
              { id: 'coanfirm', title: 'No, no trabajo' },
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
