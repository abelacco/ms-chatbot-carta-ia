import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/ApiResponses';
import { ItemService } from './item.service';
import { FindItemsByCategoryIdDto } from '../dto';
import { CreateItemDto } from '../dto/create-item.dto';

@Controller('carta-directa-db')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get('item-by-category')
  async findItemsByCategory(@Body() body: FindItemsByCategoryIdDto) {
    try {
      const response = await this.itemService.findItemsByCategory(body);
      return ApiResponse.success('Get items by category sucessfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while geting items by category',
        error,
      );
    }
  }

  @Post('item')
  async create(@Body() body: CreateItemDto) {
    try {
      const response = await this.itemService.create(body);
      return ApiResponse.success('Created item sucessfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while creating items', error);
    }
  }
}
