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
  'sin_pedido',
  'orden_sin_pago',
  'orden_con_pago',
  'preparado',
  'enviado',
  'entregado',
  'rechazado' = 9,
}

export enum Days {
  Lunes,
  Martes,
  Miercoles,
  Jueves,
  Viernes,
  Sabado,
  Domingo,
}
