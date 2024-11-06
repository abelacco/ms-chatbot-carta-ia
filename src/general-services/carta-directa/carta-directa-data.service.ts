import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CartaDirectaDataService {
  async findAllMenu(restauranteId: number): Promise<any> {
    try {
      const url = `https://menu.cartadirecta.com/api/v2/client/vendor/${restauranteId}/items`; // Usamos el restauranteId en la URL
      const response = await axios.get(url);
      return response.data; // Devuelve los datos obtenidos de la API
    } catch (error) {
      // Manejo de errores
      console.error('Error retrieving menu:', error);
      throw error; // Lanza el error para manejarlo en un nivel superior
    }
  }
}
