import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AuthService } from 'src/auth/auth.service';
import { BusinessService } from 'src/business/business.service';

@Injectable()
export class CartaDirectaService {
  constructor(
    private authService: AuthService,
    private businessServide: BusinessService,
  ) {}

  async getToken(chatbotNumber: string) {
    const url = `${process.env.URI_CARTA_DIRECTA}/vendor/auth/gettoken`;
    /* Dejar en let aunque marque error "is never reassigned" */
    // eslint-disable-next-line prefer-const
    let { email, password } = await this.businessServide.getBusiness(
      chatbotNumber,
    );

    password = this.authService.decrypt(password);
    const data = {
      email: email,
      password: password,
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

  async acceptOrder(orderId: string, chatbotNumber: string) {
    const token = await this.getToken(chatbotNumber);
    const url = `${process.env.URI_CARTA_DIRECTA}/vendor/orders/acceptorder/${orderId}?api_token=${token}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async rejectorder(orderId: string, chatbotNumber: string) {
    const token = await this.getToken(chatbotNumber);
    const url = `${process.env.URI_CARTA_DIRECTA}/vendor/orders/rejectorder/${orderId}?api_token=${token}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async changeOrderStatus(
    orderId: string,
    chatbotNumber: string,
    statusId: number,
  ) {
    const token = await this.getToken(chatbotNumber);
    const url = `${process.env.URI_CARTA_DIRECTA}/vendor/orders/updateorderstatus/${orderId}/${statusId}?api_token=${token}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getOrdersList(chatbotNumber: string) {
    const token = await this.getToken(chatbotNumber);
    const url = `${process.env.URI_CARTA_DIRECTA}/vendor/orders?api_token=${token}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getOrderById(orderId: number, chatbotNumber: string) {
    const ordersList = await this.getOrdersList(chatbotNumber);
    const order = ordersList?.find((order) => order.id === orderId);
    return order;
  }

  async parseCtxWithOrderInfo(ctx: any, chatbotNumber: string) {
    const order = await this.getOrderById(
      parseInt(ctx.currentOrderId),
      chatbotNumber,
    );
    ctx['orderStatus'] = order.last_status[0].name;
    ctx['total'] = order.order_price;
    ctx['dni'] = order.configs['DNI Cliente'];
    ctx['clientName'] = order.configs.client_name;
    order.items.forEach((item) => {
      ctx.currentOrder.push(item);
    });
    return ctx;
  }

  async getOrderStatus(orderId: number, chatbotNumber: string) {
    const order = await this.getOrderById(orderId, chatbotNumber);
    if (!order || order.length === 0) {
      return 'No hay orden';
    } else {
      const orderStatus = order.last_status[0].name;
      return orderStatus;
    }
  }

  async getMenuFromApi(id: string) {
    try {
      const response = await axios.get(
        `${process.env.URI_CARTA_DIRECTA}/client/vendor/${id}/items`,
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return null;
    }
  }

  async parseMenuFromApiResponse(id: string) {
    const menu = {
      comidas: '',
      extras: '',
      bebidas: '',
    };
    let stepMenu = 'comidas';

    const memuFromApi = await this.getMenuFromApi(id);
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
