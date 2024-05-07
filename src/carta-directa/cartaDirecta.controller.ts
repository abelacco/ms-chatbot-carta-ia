import { Controller, Get, Param, Body } from '@nestjs/common';
import { CartaDirectaService } from './cartaDirecta.service';
import { getOrderByIdBodyDto } from './dto';

@Controller('carta-directa')
export class CartaDirectaController {
  constructor(private readonly cartaDirectaService: CartaDirectaService) {}

  @Get('get-order/:id')
  getOrderById(
    @Param('id') orderId: string,
    @Body() requestBody: getOrderByIdBodyDto,
  ) {
    return this.cartaDirectaService.getOrderById(
      parseInt(orderId),
      requestBody.chatbotNumber,
    );
  }
}
