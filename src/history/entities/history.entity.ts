import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class History extends Document {
  @Prop({})
  clientPhone: string;

  @Prop({})
  content: string;

  @Prop({})
  type: string;

  @Prop({})
  chatbotNumber: string;

  @Prop({
    type: String,
    enum: ['user', 'assistant'],
  })
  role: string;
}
export const HistorySchema = SchemaFactory.createForClass(History);
