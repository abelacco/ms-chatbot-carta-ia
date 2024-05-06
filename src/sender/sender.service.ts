import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { WhatsappGateway } from 'src/wsp-web-gateway/wsp-web-gateway.gateway';

@Injectable()
export class SenderService {
  constructor(
    private gatewayService: WhatsappGateway,
    private builderService: BuilderTemplatesService,
  ) {}

  async sendMessages(messageClient: any) {
    messageClient.to = '54261156841080';
    Logger.log(
      `Mensaje a enviar ${JSON.stringify(messageClient)}`,
      'SENDER SERVICE',
    );
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.PHONE_ID}/messages`,
        messageClient,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
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

  async sendMessagesFromUi(text: string, phoneNumber: string) {
    const buildTextTemplate = await this.builderService.buildTextMessage(
      phoneNumber,
      text,
    );
    Logger.log(
      `Mensaje a enviar ${JSON.stringify(buildTextTemplate)}`,
      'SENDER SERVICE',
    );
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.PHONE_ID}/messages`,
        buildTextTemplate,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
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
