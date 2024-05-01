export interface LocationMessage {
  messaging_product: string;
  to: string;
  type: string;
  location: {
    longitude: number;
    latitude: number;
    name: string;
    address: string;
  };
}
