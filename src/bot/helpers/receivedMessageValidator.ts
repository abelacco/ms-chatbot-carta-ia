import { IParsedMessage } from '../entities/messageParsed';
import { PAYMENT_METHODS, WSP_MESSAGE_TYPES } from 'src/common/constants';
import { Ctx } from 'src/context/entities/ctx.entity';
import { STEPS } from 'src/context/helpers/constants';
import { Delivery } from 'src/delivery/entity';
import { History } from 'src/history/entities/history.entity';

export const receivedMessageValidator = (
  ctx: Ctx,
  entryMessage: IParsedMessage,
  lastMessage: History,
) => {
  if (!typeMessageIsValid(entryMessage)) {
    return 'typeMessageIsInvalid';
  }

  /* Verify user overflow */
  if (lastMessage && isLastMessageOverFlow(lastMessage)) {
    return 'userOverFlow';
  }
  const currentStep = ctx.step || STEPS.INIT;

  /* Verify if user needs help */
  if (
    entryMessage.type === 'text' &&
    entryMessage.content.toUpperCase().includes('AYUDA')
  ) {
    return 'sendHelpFlow';
  }

  /* Conversation steps switch */
  switch (currentStep) {
    case STEPS.INIT:
      return 'analyzeDataFlow';

    case STEPS.SELECT_PAY_METHOD:
      if (!PAYMENT_METHODS.includes(entryMessage.content)) {
        return 'invalidPayMethodFlow';
      } else {
        return 'sendPayFlow';
      }
    case STEPS.PRE_PAY:
      if (isImageMessage(entryMessage)) {
        return 'checkPayFlow';
      } else {
        return 'sendInfoFlowWithOrder';
      }
    case STEPS.WAITING_LOCATION:
      if (isInteractiveMessage(entryMessage)) {
        return 'locationFlow';
      } else if (isLocationMessage(entryMessage)) {
        return 'locationFlow';
      } else {
        return 'sendInfoFlowWithOrder';
      }
    case STEPS.WAITING_ADDRESS_OR_REF:
      return 'sendCatchAdressFlow';
    case STEPS.ORDERED:
      if (isInteractiveMessage(entryMessage)) {
        return 'clientConfirmDelivery';
      } else {
        return 'orderStateFlow';
      }
    default:
      return 'NOT_VALID';
  }
};

export const receivedMessageDeliveryValidator = (
  ctx: Ctx,
  entryMessage: IParsedMessage,
  delivery: Delivery,
) => {
  if (isInteractiveMessage(entryMessage)) {
    return 'deliveryConfirmOrder';
  } else {
    undefined;
  }
};

function isLastMessageOverFlow(lastMessage: any) {
  const isBotMessage = lastMessage.role === 'assistant';
  if (isBotMessage) {
    return !isBotMessage;
  } else {
    const now = new Date();
    const lastMessageDate = new Date(lastMessage.createdAt);
    const secondsAfterLastMessage =
      (now.getTime() - lastMessageDate.getTime()) / 1000;
    return !(secondsAfterLastMessage > 15);
  }
}

function typeMessageIsValid(infoMessage: IParsedMessage): boolean {
  if (isInteractiveMessage(infoMessage)) {
    return true;
  } else if (isLocationMessage(infoMessage)) {
    return true;
  } else if (isButtonMessage(infoMessage)) {
    return true;
  } else if (isTextMessage(infoMessage)) {
    return true;
  } else if (isImageMessage(infoMessage)) {
    return true;
  } else {
    return false;
  }
}

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
