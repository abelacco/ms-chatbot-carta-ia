import { Controller, Post, Param, Body } from '@nestjs/common';
import { CartaDirectaService } from './cartaDirecta.service';
import { getOrderByIdBodyDto } from './dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('carta-directa')
export class CartaDirectaController {
  constructor(private readonly cartaDirectaService: CartaDirectaService) {}

  @Post('get-order/:id')
  async getOrderById(
    @Param('id') orderId: string,
    @Body() requestBody: getOrderByIdBodyDto,
  ) {
    try {
      const response = await this.cartaDirectaService.getOrderById(
        parseInt(orderId),
        requestBody.chatbotNumber,
      );
      return ApiResponse.success('Get order successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while geting a order', error);
    }
  }
}
