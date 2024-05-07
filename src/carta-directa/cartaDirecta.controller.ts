import { Controller, Get, Query, Put } from '@nestjs/common';
import { CartaDirectaService } from './cartaDirecta.service';

@Controller('carta-directa')
export class CartaDirectaController {
  constructor(private readonly cartaDirectaService: CartaDirectaService) {}

  @Get('')
  test() {
    return this.cartaDirectaService.test();
  }
}
