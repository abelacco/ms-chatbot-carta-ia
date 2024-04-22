export interface ButtonReply {
  id: string;
  title: string;
}

export interface InteractiveButton {
  type: 'reply';
  reply: ButtonReply;
}

export interface InteractiveButtonMessage {
  messaging_product: string;
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    body: {
      text: string;
    };
    action: {
      buttons: InteractiveButton[];
    };
  };
}
