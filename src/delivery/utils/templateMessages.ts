import { notifyToDeliverysMessage } from './textMessages';

export function createTemplateNotifyToDelivery(ctx: any) {
  const message = notifyToDeliverysMessage
    .replace('{orderId}', ctx.currentOrderId)
    .replace('{clientName}', ctx.clientname)
    .replace('{clientPhone}', ctx.clientPhone)
    .replace(
      '{total}',
      (parseFloat(ctx.total) + parseFloat(ctx.deliveryCost)).toString(),
    )
    .replace('{deliveryCost}', ctx.deliveryCost)
    .replace('{addres}', ctx.address);
  return message;
}

export function createTemplateAssignDelivery(ctx: any) {
  const message = notifyToDeliverysMessage
    .replace('{orderId}', ctx.currentOrderId)
    .replace('{clientName}', ctx.clientname)
    .replace('{clientPhone}', ctx.clientPhone)
    .replace(
      '{total}',
      (parseFloat(ctx.total) + parseFloat(ctx.deliveryCost)).toString(),
    )
    .replace('{deliveryCost}', ctx.deliveryCost)
    .replace('{addres}', ctx.address);
  return message;
}
