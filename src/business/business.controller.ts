import { Controller, Get, Param } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('business')
export default class BusinessController {
  constructor(private readonly businessService: BusinessService) {}
  @Get('get-order/:id')
  hola(@Param('id') orderId: string) {
    return this.businessService.getOrderById(parseInt(orderId));
  }
}
