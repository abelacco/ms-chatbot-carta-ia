import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const response = await this.orderService.create(createOrderDto);
      return ApiResponse.success('Order created successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while creating order', error);
    }
  }

  @Get()
  async findAll() {
    try {
      const response = await this.orderService.findAll();
      return ApiResponse.success('Orders finded successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while finding orders', error);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const response = await this.orderService.findOne(id);
      return ApiResponse.success('Order finded successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while finding order', error);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    try {
      const response = await this.orderService.update(id, updateOrderDto);
      return ApiResponse.success('Order updated successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while updating order', error);
    }
  }
}
