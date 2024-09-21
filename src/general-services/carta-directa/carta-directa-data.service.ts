import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CartaDirectaDataService {
  async findAllMenu(): Promise<any> {
    try {
      const response = await axios.get(
        'https://menu.cartadirecta.com/api/v2/client/vendor/49/items',
      );
      return response.data; // Devuelve los datos obtenidos de la API
    } catch (error) {
      // Manejo de errores
      console.error('Error retrieving menu:', error);
      throw error; // Lanza el error para manejarlo en un nivel superior
    }
  }
}
