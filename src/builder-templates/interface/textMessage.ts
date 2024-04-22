// Puedes agregar esta interfaz en el mismo archivo de tus otras interfaces o en uno dedicado a definiciones de mensajes de WhatsApp
export interface TextMessage {
  messaging_product: string;
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}
