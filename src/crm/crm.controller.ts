import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrmService } from './crm.service';
import {
  CreateButtonTemplateDto,
  CreateTextTemplateDto,
  SendTextMessageDto,
} from './dto';
import { CreateImageTemplateDto } from './dto/createImageTemplate.dto';
import { SendButtonMessageDto } from './dto/sendButtonMessage.dto';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('promotion')
  async sendTextMessage(@Body() body: SendTextMessageDto) {
    const response = await this.crmService.sendTextMessage(body);
    return response;
  }

  @Post('create-text-template')
  async createTextTemplate(@Body() body: CreateTextTemplateDto) {
    const response = await this.crmService.createTextTemplate(body);
    return response;
  }

  @Post('create-button-template')
  async createButtonTemplate(@Body() body: CreateButtonTemplateDto) {
    const response = await this.crmService.createButtonTemplate(body);
    return response;
  }

  @Post('send-button-template')
  async sendButtonTemplate(@Body() body: SendButtonMessageDto) {
    const response = await this.crmService.sendButtonMessage(body);
    return response;
  }

  @Post('create-image-template')
  async createImageTemplate(@Body() body: CreateImageTemplateDto) {
    const response = await this.crmService.createImageTemplate(body);
    return response;
  }

  @Get('get-templates/:chatbotNumber')
  async getTemplates(@Param('chatbotNumber') chatbotNumber: string) {
    const response = await this.crmService.getTemplates(chatbotNumber);
    return response;
  }
}
