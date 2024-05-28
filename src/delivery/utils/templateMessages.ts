import { Business } from 'src/business/entity';
import {
  assignMessage,
  createDeliveryMessage,
  notifyToDeliverysMessage,
} from './textMessages';
import { Delivery } from '../entity';

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

export function createTemplateAssignDelivery(ctx: any, delivery: any) {
  const message = assignMessage
    .replace('{orderId}', ctx.currentOrderId)
    .replace('{clientName}', ctx.clientname)
    .replace('{clientPhone}', ctx.clientPhone)
    .replace('{time}', delivery.timeToRestaurant)
    .replace('{clientNote}', delivery.note)
    .replace(
      '{total}',
      (parseFloat(ctx.total) + parseFloat(ctx.deliveryCost)).toString(),
    )
    .replace('{deliveryCost}', ctx.deliveryCost)
    .replace('{addres}', ctx.address);
  return message;
}

export function createTemplateCreateDelivery(
  business: Business,
  delivery: Delivery,
) {
  const message = createDeliveryMessage
    .replace('{deliveryName}', delivery.name)
    .replace('{restaurantName}', business.businessName);
  return message;
}
