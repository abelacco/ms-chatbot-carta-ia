import { Injectable } from '@nestjs/common';
import { CrmService } from './crm.service';
import { DEFAULT_TEMPLATES_NAMES } from 'src/common/constants';
import { CreateAllDefaultTemplatesDto } from './dto/createAllDefaultTemplates.dto';

@Injectable()
export class DefaultTemplatesService {
  constructor(private readonly crmService: CrmService) {}

  async createAllDefaultTemplates(body: CreateAllDefaultTemplatesDto) {
    await this.welcomeDeliveryTemplate(body.chatbotNumber);
    await this.deliveriesWorksTodayTemplate(body.chatbotNumber);
    return 'Sucess';
  }

  async welcomeDeliveryTemplate(chatbotNumber: string) {
    const templateExist = await this.crmService.getTemplates(
      chatbotNumber,
      DEFAULT_TEMPLATES_NAMES.WELCOME_DELIVERIES,
    );
    if (templateExist.length === 0) {
      const template = {
        chatbotNumber: chatbotNumber,
        templateName: DEFAULT_TEMPLATES_NAMES.WELCOME_DELIVERIES,
        bodyText:
          'Buenas {{1}} te hablamos de {{2}}\nTe hemos afiliado como uno de nuestros repartidores',
        variables: ['Bruno', 'Restaurant1'],
        footer: undefined,
      };
      await this.crmService.createTextTemplate(template);
    }
  }

  async deliveriesWorksTodayTemplate(chatbotNumber: string) {
    const templateExist = await this.crmService.getTemplates(
      chatbotNumber,
      DEFAULT_TEMPLATES_NAMES.DELIVERIES_WORKS,
    );
    if (templateExist.length === 0) {
      const template = {
        chatbotNumber: chatbotNumber,
        templateName: DEFAULT_TEMPLATES_NAMES.DELIVERIES_WORKS,
        bodyText: '{{1}}, hoy trabajas?\nPorfavor confirma con los botones',
        variables: ['saludo'],
        buttons: ['Sí, si trabajo', 'No, no trabajo'],
        footer: undefined,
      };
      await this.crmService.createButtonTemplate(template);
    }
  }
}
