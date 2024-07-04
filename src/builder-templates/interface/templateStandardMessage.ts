export interface TemplateTextParameter {
  type: 'text';
  text: string;
}
export interface TemplateHeaderImageParameter {
  type: 'image';
  image: {
    link: string;
  };
}
export interface TemplatePayloadParameter {
  type: 'payload';
  payload: string;
}
export interface TemplateHeaderButtonParameter {
  type: 'button';
  sub_type: string;
  index: string;
  parameters: {
    type: 'string';
    payload: string;
  }[];
}
export interface TemplateComponent {
  type: 'header' | 'body' | 'button' | 'payload';
  sub_type?: 'quick_reply';
  index?: string;
  parameters:
    | TemplateTextParameter[]
    | TemplateHeaderImageParameter[]
    | TemplateHeaderButtonParameter[]
    | TemplatePayloadParameter[];
}
export interface TemplateMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: TemplateComponent[];
  };
}
