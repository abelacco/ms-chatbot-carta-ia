import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderFromUiDto } from './dto/sender-from-ui.dto';

@Controller('sender')
export class SenderController {
  constructor(private readonly senderService: SenderService) {}

  @Post('/send-message')
  sendMessage(@Body() botResponse: any) {
    console.log('CONTROLLER - Iniciando proceso de mensaje', botResponse);
    try {
      this.senderService.sendMessages(botResponse, botResponse.chatbotNumber);
      // response.success = 1;
      // response.message = "Message sent successfully";
      return this.senderService.sendMessages(
        botResponse,
        botResponse.chatbotNumber,
      );
    } catch (error) {
      return error;
      // response.success = 0;
      // response.message = 'Message could not be sent';
      // errorHandler(error.code, response)
    }
  }

  @Post('/send-message-from-ui')
  sendMessageFromUi(@Body() Body: SenderFromUiDto) {
    console.log('CONTROLLER - Iniciando proceso de mensaje', Body);
    try {
      return this.senderService.sendMessagesFromUi(Body);
    } catch (error) {
      return error;
      // response.success = 0;
      // response.message = 'Message could not be sent';
      // errorHandler(error.code, response)
    }
  }
}
