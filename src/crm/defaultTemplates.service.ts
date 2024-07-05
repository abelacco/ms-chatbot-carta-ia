import { Injectable } from '@nestjs/common';
import { CrmService } from './crm.service';

@Injectable()
export class DefaultTemplatesService {
  constructor(private readonly crmService: CrmService) {}

  async welcomeDeliveryTemplate(
    chatbotNumber: string,
    deliveryName: string,
    restaurantName: string,
  ) {
    const template = {
      chatbotNumber: chatbotNumber,
      templateName: 'button_test',
      bodyText:
        'Buenas {{1}} te hablamos de {{2}}\nTe hemos afiliado como uno de nuestros repartidores',
      variables: [deliveryName, restaurantName],
      footer: undefined,
    };
    await this.crmService.createTextTemplate(template);
  }
}
