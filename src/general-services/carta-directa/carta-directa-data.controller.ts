import { Controller, Get, Headers } from '@nestjs/common';
import { CartaDirectaDataService } from './carta-directa-data.service';

@Controller('carta-directa-data')
export class CartaDirectaDataController {
  constructor(
    private readonly cartaDirectaDataService: CartaDirectaDataService,
  ) {}

  @Get('all-menu')
  async findAllMenu(@Headers('restaurante-id') restauranteId: number) {
    try {
      const response = await this.cartaDirectaDataService.findAllMenu(
        restauranteId,
      ); // Pasamos el ID del restaurante al servicio
      return response;
    } catch (error) {
      return error;
    }
  }
}
