import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateVariantGroupDto, UpdateVariantGroupDto } from '../dto';
import { ApiResponse } from 'src/common/ApiResponses';
import { VariantGroupService } from './variant-group.service';

@Controller('carta-directa-db')
export class VariantGroupController {
  constructor(private readonly variantGroupService: VariantGroupService) {}

  /* Variant group */
  @Post('variant-group')
  async createVariantGroup(@Body() body: CreateVariantGroupDto) {
    try {
      const response = await this.variantGroupService.createVariantGroup(body);
      return ApiResponse.success('Created variant group sucessfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while creating variant group',
        error,
      );
    }
  }

  @Delete('variant-group/:id')
  async deleteVarianGroup(@Param('id') id: number) {
    try {
      const response = await this.variantGroupService.deleteVariantGroup(id);
      return ApiResponse.success('Delete variant group sucessfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while deleting variant group',
        error,
      );
    }
  }

  @Put('variant-group/:id')
  async updateVarianGroup(
    @Param('id') id: number,
    @Body() body: UpdateVariantGroupDto,
  ) {
    try {
      const response = await this.variantGroupService.updateVarianGroup(
        id,
        body,
      );
      return ApiResponse.success('Updated variant group sucessfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while updating variant group',
        error,
      );
    }
  }

  @Get('variant-group-by-company/:id')
  async findVariantsGroupsByCompany(@Param('id') companyId: number) {
    try {
      const response =
        await this.variantGroupService.findVariantsGroupsByCompany(companyId);
      return ApiResponse.success(
        'Get variants groups by company sucessfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while geting company variants groups by company',
        error,
      );
    }
  }
}
