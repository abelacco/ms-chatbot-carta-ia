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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { ExtraListService } from './extras-list.service';
import { CreateExtraInListDto } from '../dto/create-extra-in-list.dto';

@Controller('carta-directa-db')
export class ExtrasListController {
  constructor(private readonly extrasService: ExtraListService) {}

  @Post('create-extra-in-list')
  async createExtraInList(@Body() body: CreateExtraInListDto) {
    try {
      const response = await this.extrasService.createExtraInList(body);
      return ApiResponse.success(
        'Get categories by company sucessfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while geting categories by company',
        error,
      );
    }
  }

  @Get('get-extras-by-group/:id')
  async getExtrasByGroup(@Param('id') groupId: number) {
    try {
      const response = await this.extrasService.getExtrasByGroup(groupId);
      return ApiResponse.success(
        'Get categories by company sucessfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while geting categories by company',
        error,
      );
    }
  }
}
