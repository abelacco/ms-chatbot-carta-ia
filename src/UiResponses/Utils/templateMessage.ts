import { notifyToDeliverysMessage } from './textMessages';

export function createTemplateReponseMessage(message: string, orderId: string) {
  message = message.replace('{orderId}', orderId);
  return message;
}

export function createTemplateNotifyToDelivery(ctx: any) {
  const message = notifyToDeliverysMessage
    .replace('{orderId}', ctx.currentOrderId)
    .replace('{clientName}', ctx.clientname)
    .replace('{clientPhone}', ctx.clientPhone)
    .replace('{total}', ctx.total)
    .replace('{deliveryCost}', ctx.deliveryCost)
    .replace('{addres}', ctx.address);
  return message;
}
