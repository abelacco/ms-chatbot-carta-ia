import { Controller, Get } from '@nestjs/common';
import { CartaDirectaDataService } from './carta-directa-data.service';

@Controller('carta-directa-data')
export class CartaDirectaDataController {
  constructor(
    private readonly cartaDirectaDataService: CartaDirectaDataService,
  ) {}

  @Get('all-menu')
  async findAllMenu() {
    try {
      const response = await this.cartaDirectaDataService.findAllMenu();
      return response;
    } catch (error) {
      return error;
    }

    // return 'prueba '
  }
}
