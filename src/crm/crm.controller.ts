import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateTextTemplateDto, SendTextMessageDto } from './dto';
import { CreateImageTemplateDto } from './dto/createImageTemplate.dto';

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
