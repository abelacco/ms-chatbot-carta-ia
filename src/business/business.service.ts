import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BusinessService {
  constructor() {}

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
