export interface TemplateTextParameter {
  type: 'text';
  text: string;
}
export 
interface TemplateHeaderImageParameter {
  type: 'image';
  image: {
    link: string;
  };
}
export 
interface TemplateComponent {
  type: 'header' | 'body';
  parameters: TemplateTextParameter[] | TemplateHeaderImageParameter[];
}
export 
interface TemplateMessage {
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
