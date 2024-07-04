import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { SenderService } from 'src/sender/sender.service';
import {
  CreateButtonTemplateDto,
  CreateTextTemplateDto,
  SendTextMessageDto,
} from './dto';
import { CtxService } from 'src/context/ctx.service';
import { BusinessService } from 'src/business/business.service';
import axios from 'axios';
import fs from 'fs';
import { CreateImageTemplateDto } from './dto/createImageTemplate.dto';
import { SendButtonMessageDto } from './dto/sendButtonMessage.dto';

@Injectable()
export class CrmService {
  constructor(
    private readonly builderTemplateService: BuilderTemplatesService,
    private readonly senderService: SenderService,
    private readonly ctxService: CtxService,
    private readonly businessService: BusinessService,
  ) {}

  async sendButtonMessage(body: SendButtonMessageDto) {
    const business = await this.businessService.getBusiness(body.chatbotNumber);

    const templatesInfo = await this.getTemplates(
      body.chatbotNumber,
      body.templateName,
    );

    const selectedTemplate = templatesInfo[0];
    if (!selectedTemplate) {
      throw new NotFoundException(
        `Template with name ${body.templateName} not exist`,
      );
    }

    let template: any;
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${selectedTemplate.id}?access_token=${business.accessToken}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${business.accessToken}`,
          },
        },
      );
      template = response.data;
    } catch (error) {
      console.log(error.response.data);
      if (error.response.data.error.code === 100) {
        throw new NotFoundException(error.response.data);
      }
    }

    /* validate errors */
    const headerIsntText = template.components.find((e) => {
      return e.type === 'HEADER' && e.type !== 'TEXT';
    });
    if (headerIsntText) {
      throw new BadRequestException(
        `Template ${selectedTemplate.id} is a image template`,
      );
    }

    const isAButtonTemplate = template.components.find((e) => {
      return e.type === 'BUTTONS';
    });

    if (!isAButtonTemplate) {
      throw new BadRequestException(
        `Template ${selectedTemplate.id} isn't a button template`,
      );
    }

    const templateBody = template.components.find((e) => {
      return e.type === 'BODY';
    });

    const templateVariablesCount = templateBody.example.body_text[0].length;
    if (templateVariablesCount !== body.bodyVariables.length) {
      throw new BadRequestException(
        `The template body variables have to be ${templateVariablesCount}`,
      );
    }

    const templateName = template.name;
    const languageCode = 'es_AR';
    const bodyTexts = body.bodyVariables;

    const templateMessage = this.builderTemplateService.buildTemplateMessage(
      body.clientPhone,
      templateName,
      languageCode,
      undefined,
      bodyTexts,
      body.buttonsPayload,
    );
    let response: any;
    if (body.clientPhone !== body.chatbotNumber) {
      response = await this.senderService.sendMessages(
        templateMessage,
        body.chatbotNumber,
      );
    }

    return response;
  }

  async sendTextMessage(body: SendTextMessageDto) {
    const business = await this.businessService.getBusiness(body.chatbotNumber);

    let template: any;
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${body.templateId}?access_token=${business.accessToken}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${business.accessToken}`,
          },
        },
      );
      template = response.data;
    } catch (error) {
      console.log(error.response.data);
      if (error.response.data.error.code === 100) {
        throw new NotFoundException(error.response.data);
      }
    }

    /* validate errors */
    const headerIsntText = template.components.find((e) => {
      return e.type === 'HEADER' && e.type !== 'TEXT';
    });
    if (headerIsntText) {
      throw new BadRequestException(
        `Template ${body.templateId} is a image template`,
      );
    }

    const isAButtonTemplate = template.components.find((e) => {
      return e.type === 'BUTTONS';
    });
    if (isAButtonTemplate) {
      throw new BadRequestException(
        `Template ${body.templateId} is a button template`,
      );
    }

    const templateBody = template.components.find((e) => {
      return e.type === 'BODY';
    });

    const templateVariablesCount = templateBody.example.body_text[0].length;
    if (templateVariablesCount !== body.bodyVariables.length) {
      throw new BadRequestException(
        `The template body variables have to be ${templateVariablesCount}`,
      );
    }

    const templateName = template.name;
    const languageCode = 'es_AR';
    const bodyTexts = body.bodyVariables;

    const Ctxes = await this.ctxService.getCtxesByChatbotNumber(
      body.chatbotNumber,
    );

    Ctxes.forEach(async (element) => {
      const templateMessage = this.builderTemplateService.buildTemplateMessage(
        element.clientPhone,
        templateName,
        languageCode,
        undefined,
        bodyTexts,
      );
      if (element.clientPhone !== body.chatbotNumber) {
        await this.senderService.sendMessages(
          templateMessage,
          body.chatbotNumber,
        );
      }
    });

    return {
      message: 'Funciono',
    };
  }

  async getTemplates(chatbotNumber: string, templateName?: string) {
    const business = await this.businessService.getBusiness(chatbotNumber);
    let url = `https://graph.facebook.com/v20.0/${business.whatsappId}/message_templates`;

    if (templateName) {
      url = url + '?name=' + templateName;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${business.accessToken}`,
        },
      });
      return response.data.data;
    } catch (error) {
      console.log(error.response);
    }
  }

  async createImageTemplate(body: CreateImageTemplateDto) {
    const business = await this.businessService.getBusiness(body.chatbotNumber);

    /* Empiezan los manejos de errores */
    if (!business) {
      throw new NotFoundException(
        `Bussines with chatbotNumber ${body.chatbotNumber} not exist`,
      );
    }

    const templates = await this.getTemplates(body.chatbotNumber);
    const templateNameAlreadyExist = templates.find(
      (e) => e.name === body.templateName,
    );
    if (templateNameAlreadyExist) {
      throw new BadRequestException(`Template name already exists.`);
    }

    const regex = /{{\d+}}/g;
    const matches = body.bodyText.match(regex);
    const variablesCount = matches ? matches.length : 0;

    if (body.variables.length !== variablesCount) {
      throw new BadRequestException(
        `The array of variables needs a length of ${variablesCount}.`,
      );
    }

    /* Terminan los manejos de errores */

    /* Get image bytes */
    const contentLength = Buffer.from(body.imageBuffer, 'base64').length;
    const contentBuffer = Buffer.from(body.imageBuffer, 'base64');

    /* Get upload session */
    const uploadData = {
      file_length: contentLength,
      file_type: body.imageType,
      access_token: business.accessToken,
    };

    let uploadSessionId = '';
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${business.appId}/uploads`,
        uploadData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${business.accessToken}`,
          },
        },
      );
      uploadSessionId = response.data.id;
    } catch (error) {
      console.log(error.response.data.error);
      return;
    }

    /* upload image */
    let imageFacebookId = '';
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${uploadSessionId}`,
        contentBuffer,
        {
          headers: {
            Authorization: `OAuth ${business.accessToken}`,
            'Content-Type': 'contentType',
            file_offset: 0,
          },
        },
      );
      imageFacebookId = response.data.h;
    } catch (error) {
      console.log(error.response.data.error);
      return;
    }

    /* Create template */
    const data: any = {
      name: body.templateName,
      language: 'es_AR',
      category: 'MARKETING',
      components: [
        {
          type: 'HEADER',
          format: 'IMAGE',
          example: {
            header_handle: [imageFacebookId],
          },
        },
        {
          type: 'BODY',
          text: body.bodyText,
          example: {
            body_text: [body.variables],
          },
        },
      ],
    };

    if (body.footer) {
      data.components.push({
        type: 'FOOTER',
        text: body.footer,
      });
    }

    /* post template */
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${business.whatsappId}/message_templates`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${business.accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response.data.error);
    }
  }

  async createTextTemplate(body: CreateTextTemplateDto) {
    const business = await this.businessService.getBusiness(body.chatbotNumber);

    /* Empiezan los manejos de errores */
    if (!business) {
      throw new NotFoundException(
        `Bussines with chatbotNumber ${body.chatbotNumber} not exist`,
      );
    }

    const templates = await this.getTemplates(body.chatbotNumber);
    const templateNameAlreadyExist = templates.find(
      (e) => e.name === body.templateName,
    );
    if (templateNameAlreadyExist) {
      throw new BadRequestException(`Template name already exists.`);
    }

    const regex = /{{\d+}}/g;
    const matches = body.bodyText.match(regex);
    const variablesCount = matches ? matches.length : 0;

    if (body.variables.length !== variablesCount) {
      throw new BadRequestException(
        `The array of variables needs a length of ${variablesCount}.`,
      );
    }

    /* Terminan los manejos de errores */

    const data: any = {
      name: body.templateName,
      language: 'es_AR',
      category: 'MARKETING',
      components: [
        {
          type: 'BODY',
          text: body.bodyText,
          example: {
            body_text: [body.variables],
          },
        },
      ],
    };

    if (body.footer) {
      data.components.push({
        type: 'FOOTER',
        text: body.footer,
      });
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${business.whatsappId}/message_templates`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${business.accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response.data.error);
    }
  }

  async createButtonTemplate(body: CreateButtonTemplateDto) {
    const business = await this.businessService.getBusiness(body.chatbotNumber);

    /* Empiezan los manejos de errores */
    if (!business) {
      throw new NotFoundException(
        `Bussines with chatbotNumber ${body.chatbotNumber} not exist`,
      );
    }

    const templates = await this.getTemplates(body.chatbotNumber);
    const templateNameAlreadyExist = templates.find(
      (e) => e.name === body.templateName,
    );
    if (templateNameAlreadyExist) {
      throw new BadRequestException(`Template name already exists.`);
    }

    const regex = /{{\d+}}/g;
    const matches = body.bodyText.match(regex);
    const variablesCount = matches ? matches.length : 0;

    if (body.variables.length !== variablesCount) {
      throw new BadRequestException(
        `The array of variables needs a length of ${variablesCount}.`,
      );
    }

    /* Terminan los manejos de errores */

    const data: any = {
      name: body.templateName,
      language: 'es_AR',
      category: 'MARKETING',
      components: [
        {
          type: 'BODY',
          text: body.bodyText,
          example: {
            body_text: [body.variables],
          },
        },
        {
          type: 'BUTTONS',
          buttons: [],
        },
      ],
    };

    body.buttons.forEach((button) => {
      data.components[1].buttons.push({
        type: 'QUICK_REPLY',
        text: button,
      });
    });

    if (body.footer) {
      data.components.push({
        type: 'FOOTER',
        text: body.footer,
      });
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${business.whatsappId}/message_templates`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${business.accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response.data.error);
    }
  }
}
