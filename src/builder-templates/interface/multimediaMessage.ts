export interface MultimediaContent {
  id?: string;
  link: string;
  caption?: string;
  filename?: string;
  provider?: string;
}

export interface MultimediaMessage {
  messaging_product: string;
  recipient_type: 'individual';
  to: string;
  type: 'audio' | 'document' | 'image' | 'sticker' | 'video';
  audio?: MultimediaContent;
  document?: MultimediaContent;
  image?: MultimediaContent;
  sticker?: MultimediaContent;
  video?: MultimediaContent;
}
