export const justCreated =
  'Hemos recibido tu pedido numero: {orderId} y lo estamos analizando';

export const aceptedMessage =
  'Hemos aceptado el comprobante de pago de tu pedido numero: {orderId}';

export const rejectedMessage =
  'Hemos rechazado el comprobante de pago de tu pedido numero: {orderId}';

export const prepared = 'Tu pedido numero: {orderId} ya ha sido preparado';

export const locationMessage =
  'Hemos confirmado tu ubicación para el pedido numero: {orderId}';

export const orderDelivered =
  'Tu pedido numero: {orderId} ya ha sido entregado';

export const orderShipped = 'Tu pedido numero: {orderId} esta en camino';

export const pickUp = 'Tu pedido numero: {orderId} ya ha sido entregado';

export const statusOrderMessageList = {
  'Just created': justCreated,
  'Accepted by admin': aceptedMessage,
  Accepted: aceptedMessage,
  'Prepared by restaurant': prepared,
  'Picked up/Entregado': pickUp,
  'Delivered/ Enviado': orderShipped,
  'Rejected by admin': rejectedMessage,
  'Rejected by restaurant': rejectedMessage,
  Closed: pickUp,
};
