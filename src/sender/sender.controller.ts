import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SenderService } from './sender.service';


@Controller('sender')
export class SenderController {
  constructor(private readonly senderService: SenderService) {}

  @Post('/sendMessage')
  sendMessage(@Body() botResponse: any) {
    console.log('CONTROLLER - Iniciando proceso de mensaje', botResponse);
    try {
      this.senderService.sendMessages(botResponse);
      // response.success = 1;
      // response.message = "Message sent successfully";
      return  this.senderService.sendMessages(botResponse);
    } catch (error) {
      return error;
      // response.success = 0;
      // response.message = 'Message could not be sent';
      // errorHandler(error.code, response)
    }
  }

}
