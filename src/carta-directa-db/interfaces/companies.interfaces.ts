export interface ICompany {
  id: string;
  createdAt: Date;
  updatedAt: Date; // Cambiado a camel case
  name: string;
  subdomain: string;
  logo: string;
  cover: string;
  active: number;
  userId: string; // Cambiado a camel case
  lat: string;
  lng: string;
  address: string;
  phone: string;
  minimum: string;
  description: string;
  fee: number;
  staticFee: number; // Cambiado a camel case
  radius: string;
  isFeatured: number; // Cambiado a camel case
  cityId: null; // Cambiado a camel case
  views: number;
  canPickup: number; // Cambiado a camel case
  canDeliver: number; // Cambiado a camel case
  selfDeliver: number; // Cambiado a camel case
  freeDeliver: number; // Cambiado a camel case
  whatsappPhone: null; // Cambiado a camel case
  fbUsername: null; // Cambiado a camel case
  doCovertion: number; // Cambiado a camel case
  currency: string;
  paymentInfo: string; // Cambiado a camel case
  molliePaymentKey: string; // Cambiado a camel case
  deletedAt: null; // Cambiado a camel case
  canDinein: number; // Cambiado a camel case
}
