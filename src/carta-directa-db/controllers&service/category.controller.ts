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

@Controller('carta-directa-db')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('category-by-company/:id')
  async findByCompanyId(@Param('id') companyId: number) {
    try {
      const response = await this.categoryService.findByCompanyId(companyId);
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

  @Post('category')
  async create(@Body() body: CreateCategoryDto) {
    try {
      const response = await this.categoryService.create(body);
      return ApiResponse.success('Create category sucessfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while creating category by company',
        error,
      );
    }
  }
}
