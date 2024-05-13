import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import {
  CreateDeliveryDto,
  DeleteDeliveryDto,
  FindDeliveriesByClientDto,
  NotifyDeliveryDto,
  UpdateDeliveryDto,
} from './dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('delivery')
export default class Deliverycontroller {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('create')
  async createBusiness(@Body() createBusinessDto: CreateDeliveryDto) {
    try {
      const response = await this.deliveryService.createDelivery(
        createBusinessDto,
      );
      return ApiResponse.success('Delivery created successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while creating delivery',
        error,
      );
    }
  }

  @Get('find-by-client/:chatbotNumber')
  async findByClient(@Param('chatbotNumber') chatbotNumber: string) {
    try {
      const response = await this.deliveryService.findByClient({
        chatbotNumber,
      });
      return ApiResponse.success('Find deliveries successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error occurred while finding deliveries',
        error,
      );
    }
  }

  @Put('update')
  async update(@Body() body: UpdateDeliveryDto) {
    try {
      const response = await this.deliveryService.update(body);
      return ApiResponse.success('Update delivery successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error occurred while updating delivery',
        error,
      );
    }
  }

  @Delete('remove')
  async remove(@Body() body: DeleteDeliveryDto) {
    try {
      const response = await this.deliveryService.remove(body);
      return ApiResponse.success('Remove delivery successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error occurred while removing delivery',
        error,
      );
    }
  }

  @Post('notify-delivery')
  async notifyDelivery(@Body() body: NotifyDeliveryDto) {
    try {
      const response = await this.deliveryService.notifyDelivery(body);
      return ApiResponse.success('Successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while notifying to deliverys',
        error,
      );
    }
  }
}
