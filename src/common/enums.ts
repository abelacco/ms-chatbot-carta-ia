export enum EnumOrderStatusCD {
  'Just created',
  'Accepted by admin',
  'Accepted',
  'Prepared by restaurant',
  'Picked up/Entregado',
  'Delivered/ Enviado',
  'Rejected by admin',
  'Rejected by restaurant',
  'Closed',
}

export enum EnumOrderStatusBot {
  'pidiendo',
  'orden',
  'pagado',
  'cocina',
  'preparado',
  'enviado',
  'entregado',
  'rechazado' = 9,
}
