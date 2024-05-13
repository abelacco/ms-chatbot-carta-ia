export function createTemplateReponseMessage(message: string, orderId: string) {
  message = message.replace('{orderId}', orderId);
  return message;
}
