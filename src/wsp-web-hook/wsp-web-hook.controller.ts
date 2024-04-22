import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, BadRequestException, Query } from '@nestjs/common';
import { WspWebHookService } from './wsp-web-hook.service';
import { WspQueriesDto } from './dto';
import { WspReceivedMessageDto } from 'src/common/dto';
import { WhatsappGateway } from 'src/wsp-web-gateway/wsp-web-gateway.gateway';


@Controller('wsp-web-hook')
export class WspWebHookController {
  constructor(private readonly wspWebHookService: WspWebHookService, private gatewayService: WhatsappGateway) {}

  // Entrada de mensajes desde WhatsApp
  @Post()
  @HttpCode(200)
   proccess(@Body() messageWSP: WspReceivedMessageDto) {
    try {
      console.log('Received message from WSP');
      
      // llamamos al servicio para procesar el mensaje y retornamos OK al servidor de WSP para que no siga enviando el mensaje
      this.wspWebHookService.proccessMessage(messageWSP);
      return 'OK';
    } catch (error) {
      throw new BadRequestException('Received');
    }
  }

  @Get()
  find(@Query() wspQueries: WspQueriesDto) {
    try {
      return this.wspWebHookService.validateWebHook(wspQueries);
    } catch (error) {
      throw new BadRequestException('Received');
    }
  }
}
