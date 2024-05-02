import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BusinessService {
  constructor() {}

  async getToken() {
    const url = 'https://menu.cartadirecta.com/api/v2/vendor/auth/gettoken';
    const data = {
      email: process.env.CARTA_DIRECTA_EMAIL,
      password: process.env.CARTA_DIRECTA_PASSWORD,
    };

    try {
      const response = await axios.post(url, data);
      return response.data.token;
    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.data);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  async getOrdersList() {
    const token = await this.getToken();
    const url = `https://menu.cartadirecta.com/api/v2/vendor/orders?api_token=${token}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getOrderById(orderId: number) {
    const ordersList = await this.getOrdersList();
    const order = ordersList.find((order) => order.id === orderId);
    return order;
  }

  async getOrderStatus(orderId: number) {
    const order = await this.getOrderById(orderId);
    if (!order || order.length === 0) {
      return 'No hay orden';
    } else {
      const orderStatus = order.last_status[0].name;
      return orderStatus;
    }
  }

  async getMenuFromApi() {
    try {
      const response = await axios.get(
        'https://menu.cartadirecta.com/api/v2/client/vendor/38/items',
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return null;
    }
  }

  async parseMenuFromApiResponse() {
    const menu = {
      comidas: '',
      extras: '',
      bebidas: '',
    };
    let stepMenu = 'comidas';

    const memuFromApi = await this.getMenuFromApi();
    memuFromApi.forEach((element, index) => {
      if (index === 6) {
        stepMenu = 'bebidas';
      }

      menu[stepMenu] =
        menu[stepMenu] +
        JSON.stringify(
          element.map((item: any) => ({
            name: item.name,
            description: item.description,
            price: item.price,
          })),
        );

      if (index === 0) {
        menu.extras = JSON.stringify(
          element[0].extras.map((item) => ({
            name: item.name,
            price: item.price,
          })),
        );
      }
    });

    return menu;
  }
}
