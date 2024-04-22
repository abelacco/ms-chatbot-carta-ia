import { isInt } from 'class-validator';
import { IParsedMessage } from '../entities/messageParsed';
import { WSP_MESSAGE_TYPES } from 'src/common/constants';
import { Ctx} from 'src/context/entities/ctx.entity';
import {STEPS } from 'src/context/helpers/constants';



// En esta función voy a recibir el paso en el que el carrito de compras se encuentra
// Si recibe que el carrito de compras esta en el paso init , entonces el mensaje que reciba debe ser de tipo texto
// Si recibe que el carrito de compras esta en el paso put_dni , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso insert_date , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso select_provider , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso select_payment , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso submit_voucher , entonces el mensaje que reciba debe ser de tipo image
export const receivedMessageValidator =  
(
  ctx: Ctx,
  entryMessage: IParsedMessage,
) => {
  let currentStep = ctx.step || STEPS.INIT;
  if( typeof entryMessage.content === 'string' && entryMessage.content.toUpperCase() === 'RESET') {
    return 'resetExpenseFlow';
  }
  switch (currentStep) {
    case STEPS.INIT: // Respondo al primer saludo
      if (isTextMessage(entryMessage)) {
        // Debo llamar al servicio para responder
        return 'analyzeDataFlow';
      }
      // debo llamar al servicio para responder que no es el mensaje esperado
      return 'NOT_VALID';
    case STEPS.CARTA: // Estoy esperando que el usuario seleccione una fecha o pregunte por otra cosa
      if (isInteractiveMessage(entryMessage)) {
        // Si es fecha seleccionada, debo enviar el flow de confirmacion de datos
        return 'preconfirmFlow';
      } else if(isTextMessage(entryMessage)) {
        // LLamo al flow para responder infor general
        return 'analyzeDataFlow';
      }
      return 'NOT_VALID';
    case STEPS.EXTRA_DATA: // Estoy esperando que el usuario confirmen los datos adicionales o tambien puede que cambie de fecha
      if(isTextMessage(entryMessage)) {
        // Entra al flujo para corrobar los datos extras
        return 'checkExtaDataFlow';
      } else if(isInteractiveMessage(entryMessage)){
        // Asume que estas escogiendo otra fecha
        return 'preconfirmFlow'
      } else {
        return 'NOT_VALID'
      }
    case STEPS.AFTER_CONFIRM: // Estoy esperando que el cliente reagende o haga preguntas adicionales
      if(isTextMessage(entryMessage)) {
        return 'anlyzeAfterConfirmFlow';
      }
      return 'NOT_VALID';
    case STEPS.WAITING_FOR_RESCHEDULE:
      if(isTextMessage(entryMessage)) {
        return 'analyzeAnswerFlow';
      }
      return 'NOT_VALID';
        default:
      return 'NOT_VALID';
  }
};


// export const isResetMessage = (infoMessage: IParsedMessage): boolean => infoMessage.content.id === ID.RESET;


export const isInteractiveMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE;

export const isButtonMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.BUTTON;

export const isTextMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type ===  WSP_MESSAGE_TYPES.TEXT;

export const isImageMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.IMAGE;

export const hasSpecificContentId = (infoMessage: IParsedMessage, expectedId: string): boolean =>  infoMessage.content.id === expectedId;

export const hasSpecificTitle = (infoMessage: IParsedMessage, expectedTitle: string): boolean => infoMessage.content.title.toUpperCase() === expectedTitle;









