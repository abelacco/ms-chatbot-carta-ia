export interface WspReceivedMessageDto {
  entry: Array<{
    changes: Array<{
      value: {
        contacts?: Array<IContact>;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        messages?: Array<IMessage>;
        statuses?: [{
          status: string;
        }]
      };
    }>;
  }>;
}

interface IContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

interface IMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: IImageObject;
  interactive?: IInteractiveObject;
  button?: {
    payload: string;
    text: string;
  };
}

interface IImageObject {
  link?: string;
  id?: string;
  sha256?: string;
  caption?: string;
  mime_type?: string;
}

interface IInteractiveObject {
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description: string;
  };
  type: string;

}
