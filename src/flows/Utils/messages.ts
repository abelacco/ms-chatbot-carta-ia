export const reminderVoucherMessage =
  'Por favor, no te olvides de enviarnos foto de tu comprobante de pago';
export const reminderLocationMessage =
  'Por favor, no te olvides de enviarnos compartirnos tu ubicación por whatsapp';

export const noVoucherPaymentMethodMessage = (paymentMethod: string) => {
  return `Has elegido: ${paymentMethod}\nYa confirmamos tu pedido y lo estamos preparando, te avisaremos cuando este listo`;
};

export const confirmDeliveryMessage =
  'Porfavor confirma que hayas recibido tu pedido';

export const userOverFlowMessage =
  'Porfavor, manda tus mensajes uno por uno y espera a que te respondamos antes de enviar el siguiente. No podemos procesar varios mensajes a la vez. 😊';

export const responseConfirmDeliveryByClientMessage =
  'Muchas gracias por confirmar, que disfrutes tu pedido 😊';
export const paymentMethodMessage = (
  paymentMethod: string,
  accountNumber: string,
  accountName: string,
) => {
  const message = `Has elegido: ${paymentMethod}\nRealiza tu pago a la cuenta numero: ${accountNumber} a nombre de: ${accountName} `;
  return message;
};

export const invalidMessageFormatMessage =
  'Por el momento no aceptamos este tipo de formato de mensaje, porfavor envía mensajes de texto, imagen o ubicación en el caso que te lo pidamos 😊';
