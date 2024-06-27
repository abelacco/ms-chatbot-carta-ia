export const nothing = '';

export const justCreated =
  'Hemos recibido tu pedido numero: {orderId} y lo estamos analizando';

export const aceptedMessage =
  'Hemos aceptado el pago de tu pedido numero: {orderId}\nPorfavor compartenos tu ubicación por whatsapp';

export const acceptedMessageWithoutLocation =
  'Hemos aceptado el pago de tu pedido numero: {orderId}';

export const aceptedMessageWithoutLocation =
  'Hemos aceptado el pago de tu pedido numero: {orderId}\nTe avisaremos cuando tu pedido estre preparado';

export const inCooking =
  'Tu pedido numero: {orderId} esta en preparación, te avisaremos cuando este listo';

export const rejectedMessage =
  'Hemos rechazado el pago de tu pedido numero: {orderId}\nPorfavor envianos un comprobante de pago valido';

export const prepared = 'Tu pedido numero: {orderId} ya ha sido preparado';

export const locationMessage =
  'Hemos confirmado tu ubicación para el pedido numero: {orderId}';

export const orderDelivered =
  'Tu pedido numero: {orderId} ya ha sido entregado';

export const orderShipped =
  'Tu pedido numero: {orderId} esta en camino\nTu repartidor es: {deliveryName}\nEl numero de tu repartidor es: {deliveryNumber}';

export const pickUp = 'Tu pedido numero: {orderId} ya ha sido entregado';

export const generalDecline =
  'Hemos rechazo tu pedido, porfavor vuelve a realizar tu pedido';

export const isOtherLocationMessage =
  'En caso de esta no sea tu ubicación, enviamos tu nueva ubicación. 😊';

export const orderReadyToPickUp =
  'Tu pedido ya esta listo para ser recogido. 😊';

export const statusOrderMessageList = {
  0: nothing,
  1: justCreated,
  2: aceptedMessage,
  3: prepared,
  4: orderShipped,
  5: pickUp,
  9: generalDecline,
};
