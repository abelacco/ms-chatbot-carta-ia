import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { SenderService } from 'src/sender/sender.service';
import { CtxService } from 'src/context/ctx.service';
import { BusinessService } from 'src/business/business.service';
import { HistoryService } from 'src/history/history.service';
import { DeliveryService } from 'src/delivery/delivery.service';
import { isTimeDifferenceGreater } from './utils/utils';

@Injectable()
export class DeliveryCrmService {
  constructor(
    private readonly builderTemplateService: BuilderTemplatesService,
    private readonly senderService: SenderService,
    private readonly ctxService: CtxService,
    private readonly businessService: BusinessService,
    private readonly historyService: HistoryService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async deliveriesWorkToday() {
    const deliveries = await this.deliveryService.findAll();
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
