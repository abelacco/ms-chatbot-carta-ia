import { isInt } from 'class-validator';
import { IParsedMessage } from '../entities/messageParsed';
import { STATUS_BOT, WSP_MESSAGE_TYPES } from 'src/common/constants';
import { Ctx } from 'src/context/entities/ctx.entity';
import { STEPS } from 'src/context/helpers/constants';

export const receivedMessageValidator = (
  ctx: Ctx,
  entryMessage: IParsedMessage,
) => {
  const currentStep = ctx.step || STEPS.INIT;
  console.log(currentStep);
  if (
    entryMessage.type === 'text' &&
    entryMessage.content.toUpperCase().includes('AYUDA')
  ) {
    return 'sendHelpFlow';
  }
  switch (currentStep) {
    case STEPS.INIT: // Respondo al primer saludo
      //if (isTextMessage(entryMessage)) {
      // Debo llamar al servicio para responder
      return 'analyzeDataFlow';
      //}
      break;
    case STEPS.PRE_PAY:
      if (isImageMessage(entryMessage)) {
        return 'checkPayFlow';
      } else {
        return 'analyzeDataFlow';
      }
    case STEPS.WAITING_LOCATION:
      if (isLocationMessage(entryMessage)) {
        return 'locationFlow';
      } else {
        return 'analyzeDataFlow';
      }
    case STEPS.ORDERED:
      return 'orderStateFlow';
    default:
      return 'NOT_VALID';
  }
};

// export const isResetMessage = (infoMessage: IParsedMessage): boolean => infoMessage.content.id === ID.RESET;

export const isInteractiveMessage = (infoMessage: IParsedMessage): boolean =>
  infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE;

export const isLocationMessage = (infoMessage: IParsedMessage): boolean =>
  infoMessage.type === WSP_MESSAGE_TYPES.LOCATION;

export const isButtonMessage = (infoMessage: IParsedMessage): boolean =>
  infoMessage.type === WSP_MESSAGE_TYPES.BUTTON;

export const isTextMessage = (infoMessage: IParsedMessage): boolean =>
  infoMessage.type === WSP_MESSAGE_TYPES.TEXT;

export const isImageMessage = (infoMessage: IParsedMessage): boolean =>
  infoMessage.type === WSP_MESSAGE_TYPES.IMAGE;

export const hasSpecificContentId = (
  infoMessage: IParsedMessage,
  expectedId: string,
): boolean => infoMessage.content.id === expectedId;

export const hasSpecificTitle = (
  infoMessage: IParsedMessage,
  expectedTitle: string,
): boolean => infoMessage.content.title.toUpperCase() === expectedTitle;
