import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { WhatsappGateway } from 'src/wsp-web-gateway/wsp-web-gateway.gateway';

@Injectable()
export class SenderService {
  constructor(private gatewayService: WhatsappGateway) {}

  async sendMessages(messageClient: any) {
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
}
