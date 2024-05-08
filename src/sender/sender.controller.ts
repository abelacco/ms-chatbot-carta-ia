import { Controller, Post, Body } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderFromUiDto } from './dto/sender-from-ui.dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('sender')
export class SenderController {
  constructor(private readonly senderService: SenderService) {}

  @Post('/send-message')
  async sendMessage(@Body() botResponse: any) {
    try {
      const response = await this.senderService.sendMessages(
        botResponse,
        botResponse.chatbotNumber,
      );
      return ApiResponse.success('Send message successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while sending message', error);
    }
  }

  @Post('/send-message-from-ui')
  async sendMessageFromUi(@Body() Body: SenderFromUiDto) {
    try {
      const response = await this.senderService.sendMessagesFromUi(Body);
      return ApiResponse.success('Send message from ui successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while sending message from ui',
        error,
      );
    }
  }
}
