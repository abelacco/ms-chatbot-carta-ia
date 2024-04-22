export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string; // Ahora es opcional
}

export interface InteractiveListSection {
  title: string;
  rows: InteractiveListRow[];
}

export interface InteractiveListMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  interactive: {
    type: string;
    header?: { // Ahora es opcional
      type: string;
      text: string;
    };
    body?: { // Ahora es opcional
      text: string;
    };
    footer?: { // Ahora es opcional
      text: string;
    };
    action: {
      button: string;
      sections: InteractiveListSection[];
    };
  };
}
