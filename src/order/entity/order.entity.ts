import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PAYMENT_METHODS } from 'src/common/constants';

@Schema()
export class Order {
  @Prop({ required: true })
  chatBotNumber: string;

  @Prop({ required: true })
  clientPhone: string;

  @Prop({ required: true })
  order: string;

  @Prop({ required: true, unique: true })
  orderId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  deliveryCost: number;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true, enum: PAYMENT_METHODS })
  paymentMethod: string;

  @Prop()
  note: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
