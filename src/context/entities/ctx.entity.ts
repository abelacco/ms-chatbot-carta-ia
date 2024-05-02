import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Product } from '../interface';

@Schema()
export class Ctx extends Document {
  @Prop()
  chatbotNumber: string;

  @Prop()
  clientname: string;

  @Prop()
  dni: string;

  @Prop()
  clientPhone: string;

  @Prop()
  order: string;

  @Prop()
  address: string;

  @Prop()
  lat: string;

  @Prop()
  lng: string;

  @Prop()
  deliveryCost: number;

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
