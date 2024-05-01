// WASAP MESSAGE TYPES
export const WSP_MESSAGE_TYPES = {
  TEXT: 'text',
  INTERACTIVE: 'interactive',
  IMAGE: 'image',
  BUTTON: 'button',
  LOCATION: 'location',
};

export const INTERACTIVE_REPLIES_TYPES = {
  BUTTON_REPLY: 'button_reply',
  LIST_REPLY: 'list_reply',
};

export const MULTIMEDIA_TYPES = {
  AUDIO: 'audio',
  DOCUMENT: 'document',
  IMAGE: 'image',
  STICKER: 'sticker',
  VIDEO: 'video',
};

export const DOCUMENT_IDENTIFIERS = {
  DNI_LENGTH: 8,
  RUC_LENGTH: 11,
  DNI_TYPE: 'dni',
  RUC_TYPE: 'ruc',
};

export const ORDER_STATUS = {
  JUST_CREATED: 'Just created',
  ACEPTED_BY_ADMIN: 'Accepted by admin',
  ACCEPTED: 'Accepted',
  PREPARED_BY_RESTAURANT: 'Prepared by restaurant',
  PICKED_UP: 'Picked up/Entregado',
  DELIVERED: 'Delivered/ Enviado',
  REJECTED_BY_ADMIN: 'Rejected by admin',
  REJECTED_BY_RESTAURANT: 'Rejected by restaurant',
  CLOSED: 'Closed',
};
