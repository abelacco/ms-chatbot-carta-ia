import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Delivery extends Document {
  @Prop()
  chatbotNumber: string;

  @Prop()
  deliveryNumber: string;

  @Prop()
  name: string;

  @Prop()
  status: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  timeToRestaurant: number;

  @Prop()
  note: string;

  @Prop()
  currentOrderId: string;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);

DeliverySchema.index({ chatbotNumber: 1, deliveryNumber: 1 }, { unique: true });
