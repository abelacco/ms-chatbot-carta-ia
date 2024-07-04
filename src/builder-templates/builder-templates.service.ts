import { Injectable } from '@nestjs/common';
import {
  ButtonReply,
  InteractiveButtonMessage,
  InteractiveListMessage,
  InteractiveListSection,
  TextMessage,
  MultimediaMessage,
  TemplateComponent,
  TemplateTextParameter,
  TemplateMessage,
  LocationMessage,
} from './interface/index';

@Injectable()
export class BuilderTemplatesService {
  constructor() {}

  buildTextMessage(phoneNumber: string, bodyText: string): TextMessage {
    return {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: bodyText,
      },
    };
  }

  buildLocationMessage(
    phoneNumber: string,
    longitude: number,
    latitude: number,
    name?: string,
    address?: string,
  ): LocationMessage {
    return {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'location',
      location: {
        longitude: longitude,
        latitude: latitude,
        name: name,
        address: address,
      },
    };
  }

  buildInteractiveListMessage(
    phoneNumber: string,
    buttonText: string,
    sections: InteractiveListSection[],
    headerText?: string,
    bodyText?: string,
    footerText?: string,
  ): InteractiveListMessage {
    const interactive: InteractiveListMessage['interactive'] = {
      type: 'list',
      action: { button: buttonText, sections },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }

    if (bodyText) {
      interactive.body = { text: bodyText };
    }

    if (footerText) {
      interactive.footer = { text: footerText };
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'interactive',
      interactive,
    };
  }

  buildInteractiveButtonMessage(
    phoneNumber: string,
    bodyText: string,
    buttons: ButtonReply[],
  ): InteractiveButtonMessage {
    // Validamos que no se incluyan más de 3 botones
    if (buttons.length > 3) {
      throw new Error('No se pueden incluir más de 3 botones.');
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText,
        },
        action: {
          buttons: buttons.map((button) => ({
            type: 'reply',
            reply: button,
          })),
        },
      },
    };
  }

  buildMultimediaMessage(
    to: string,
    type: 'audio' | 'document' | 'image' | 'sticker' | 'video',
    options: {
      id?: string;
      link?: string;
      caption?: string;
      filename?: string;
      provider?: string;
    },
  ): MultimediaMessage {
    // Validar que si el tipo es distinto de 'text', se debe proporcionar o 'id' o 'link'.
    if (!options.id && !options.link) {
      throw new Error("Se requiere 'id' o 'link' para mensajes multimedia.");
    }

    const message: MultimediaMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: type,
      [type]: {
        ...(options.id && { id: options.id }),
        link: options.link,
        ...(options.caption && { caption: options.caption }),
        ...(type === 'document' &&
          options.filename && { filename: options.filename }),
        ...(options.provider && { provider: options.provider }),
      },
    };

    return message;
  }

  buildTemplateMessage(
    phoneNumber: string,
    templateName: string,
    languageCode: string,
    headerImageUrl: string | undefined,
    bodyTexts: any[],
    buttons?: any[],
  ): TemplateMessage {
    const components: TemplateComponent[] = [];

    // Añadir header con imagen si se proporciona
    if (headerImageUrl) {
      components.push({
        type: 'header',
        parameters: [
          {
            type: 'image',
            image: { link: headerImageUrl },
          },
        ],
      });
    }

    // Añadir body con parámetros de texto
    const bodyParameters: TemplateTextParameter[] = bodyTexts.map((text) => ({
      type: 'text',
      text: text,
    }));

    if (bodyParameters.length > 0) {
      components.push({
        type: 'body',
        parameters: bodyParameters,
      });
    }

    if (buttons) {
      buttons.forEach((button, index) => {
        components.push({
          type: 'button',
          sub_type: 'quick_reply',
          index: index.toString(),
          parameters: [
            {
              type: 'payload',
              payload: button,
            },
          ],
        });
      });
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: components,
      },
    };
  }
}
