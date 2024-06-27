import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Business extends Document {
  @Prop()
  businessName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: String,
    unique: true,
  })
  businessId: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
  })
  chatbotNumber: string;

  @Prop()
  adminPhone: string;

  @Prop()
  businessHours: string[];

  @Prop()
  isActive: boolean;

  @Prop()
  address: string;

  @Prop()
  slogan: string;

  @Prop()
  phoneId: string;

  @Prop()
  accessToken: string;

  @Prop()
  whatsappId: string;

  @Prop()
  appId: string;

  @Prop([
    {
      paymentMethodName: String,
      available: Boolean,
      accountNumber: String,
      accountName: String,
      type: {
        type: Number,
        default: 0,
      },
    },
  ])
  paymentMethods: {
    paymentMethodName: string;
    available: boolean;
    accountNumber: string;
    accountName: string;
    type: number;
  }[];

  @Prop([
    {
      area: String,
      price: Number,
    },
  ])
  coverage: {
    area: string;
    price: number;
  }[];
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
