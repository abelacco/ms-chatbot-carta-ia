import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import {
  AssignDeliveryDto,
  CreateDeliveryDto,
  DeleteDeliveryDto,
  FindDeliveriesByClientDto,
  FindOneDeliveryDto,
  NotifyDeliveryDto,
  UpdateDeliveryDto,
} from './dto';
import { ApiResponse } from 'src/common/ApiResponses';
import { query } from 'express';

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

  @Get('find-one')
  async findOne(@Query() query: FindOneDeliveryDto) {
    try {
      const response = await this.deliveryService.findOne(query);
      return ApiResponse.success('Find delivery successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error occurred while finding delivery',
        error,
      );
    }
  }

  @Put('assign-delivery')
  async assignDelivery(@Body() body: AssignDeliveryDto) {
    try {
      const response = await this.deliveryService.assignDelivery(body);
      return ApiResponse.success('Assign delivery successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while assigning all ctx',
        error,
      );
    }
  }
}
