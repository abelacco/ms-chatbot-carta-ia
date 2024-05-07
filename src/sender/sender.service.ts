import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from 'src/auth/auth.service';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { BusinessService } from 'src/business/business.service';
import { WhatsappGateway } from 'src/wsp-web-gateway/wsp-web-gateway.gateway';
import { SenderFromUiDto } from './dto/sender-from-ui.dto';

@Injectable()
export class SenderService {
  constructor(
    private gatewayService: WhatsappGateway,
    private builderService: BuilderTemplatesService,
    private readonly businessService: BusinessService,
    private readonly authService: AuthService,
  ) {}

  async sendMessages(messageClient: any, chatbotNumber: string) {
    messageClient.to = '54261156841080';
    const businessInfo = await this.businessService.getBusiness(chatbotNumber);
    const accessToken = this.authService.decrypt(businessInfo.accessToken);

    Logger.log(
      `Mensaje a enviar ${JSON.stringify(messageClient)}`,
      'SENDER SERVICE',
    );
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${businessInfo.phoneId}/messages`,
        messageClient,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      Logger.log(`STATUS ${response.status}`, 'SENDER SERVICE');
      this.gatewayService.server.emit('newMessage');
    } catch (error) {
      Logger.error(
        `Mensaje: ${error.response.data.error.message}`,
        'SENDER SERVICE',
      );
      // Logger.error(`Detalle: ${error.response.data.error.error_data.details}`, 'SENDER SERVICE');
      throw new Error(error.response.data.error.message);
    }
  }

  async sendMessagesFromUi(body: SenderFromUiDto) {
    /* Build Message template */
    const buildTextTemplate = this.builderService.buildTextMessage(
      body.phoneNumber,
      body.text,
    );
    /* Get business info */
    const businessInfo = await this.businessService.getBusiness(
      body.chatbotNumber,
    );
    const accessToken = this.authService.decrypt(businessInfo.accessToken);
    /* Send meta message request */
    Logger.log(
      `Mensaje a enviar ${JSON.stringify(buildTextTemplate)}`,
      'SENDER SERVICE',
    );
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${businessInfo.phoneId}/messages`,
        buildTextTemplate,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      Logger.log(`STATUS ${response.status}`, 'SENDER SERVICE');
      this.gatewayService.server.emit('newMessage');
    } catch (error) {
      Logger.error(
        `Mensaje: ${error.response.data.error.message}`,
        'SENDER SERVICE',
      );
      // Logger.error(`Detalle: ${error.response.data.error.error_data.details}`, 'SENDER SERVICE');
      throw new Error(error.response.data.error.message);
    }
  }
}
