import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Ctx extends Document {
  @Prop()
  chatbotNumber: string;

  @Prop()
  clientname: string;

  @Prop()
  orderName: string;

  @Prop()
  dni: string;

  @Prop()
  clientPhone: string;

  @Prop({ default: false })
  isManual: boolean;

  @Prop({ default: [] })
  orders: string[];

  @Prop({ type: Object })
  currentOrder: Record<any, any>;

  @Prop()
  currentOrderId: string;

  @Prop()
  help: number;

  @Prop()
  orderStatus: number;

  @Prop()
  address: string;

  @Prop()
  lat: string;

  @Prop()
  lng: string;

  @Prop()
  deliveryCost: number;

  @Prop()
  deliveryNumber: string;

  @Prop()
  deliveryName: string;

  @Prop()
  total: number;

  @Prop()
  paymentMethod: string;

  @Prop()
  date: Date;

  @Prop()
  statusBot: number;

  @Prop()
  step: string;

  @Prop()
  attempts: number;

  @Prop()
  voucherUrl: string;

  @Prop()
  codeLinkPay: string;
}

export const CtxSchema = SchemaFactory.createForClass(Ctx);
