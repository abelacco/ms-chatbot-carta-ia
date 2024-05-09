export const nothing = '';

export const notifyToDeliverysMessage =
  'Pedido numero: {orderId}\nPara: {clientName}\nDirección: {addres}\nNumero del cliente: {clientPhone}\nCosto total: {total}\nCosto delivery: {deliveryCost}';

export const justCreated =
  'Hemos recibido tu pedido numero: {orderId} y lo estamos analizando';

export const aceptedMessage =
  'Hemos aceptado el comprobante de pago de tu pedido numero: {orderId}\nPorfavor compartenos tu ubicación por whatsapp';

export const inCooking =
  'Tu pedido numero: {orderId} esta en preparación, te avisaremos cuando este listo';

export const rejectedMessage =
  'Hemos rechazado el comprobante de pago de tu pedido numero: {orderId}';

export const prepared = 'Tu pedido numero: {orderId} ya ha sido preparado';

export const locationMessage =
  'Hemos confirmado tu ubicación para el pedido numero: {orderId}';

export const orderDelivered =
  'Tu pedido numero: {orderId} ya ha sido entregado';

export const orderShipped = 'Tu pedido numero: {orderId} esta en camino';

export const pickUp = 'Tu pedido numero: {orderId} ya ha sido entregado';

export const generalDecline =
  'Hemos rechazo tu pedido, porfavor vuelve a realizar tu pedido';

export const statusOrderMessageList = {
  0: nothing,
  1: justCreated,
  2: aceptedMessage,
  3: inCooking,
  4: prepared,
  5: orderShipped,
  6: pickUp,
  9: generalDecline,
};
