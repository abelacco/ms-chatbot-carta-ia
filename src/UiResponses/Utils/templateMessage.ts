import { ORDER_STATUS_BOT } from 'src/common/constants';

export function createTemplateReponseMessage(
  message: string,
  orderId: string,
  orderStatus: number,
  ctx: any,
) {
  if (orderStatus === ORDER_STATUS_BOT.enviado) {
    message = message
      .replace('{orderId}', orderId)
      .replace('{deliveryName}', ctx.deliveryName)
      .replace('{deliveryNumber}', ctx.deliveryNumber);
    console.log('Llego');
  } else {
    message = message.replace('{orderId}', orderId);
  }
  return message;
}
