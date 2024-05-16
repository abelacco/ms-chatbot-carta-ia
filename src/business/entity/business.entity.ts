import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Business extends Document {
  @Prop()
  businessName: string;

  @Prop({
    type: String,
    unique: true,
  })
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
  isActive: string;

  @Prop()
  address: string;

  @Prop()
  slogan: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
  })
  phoneId: string;

  @Prop()
  accessToken: string;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
