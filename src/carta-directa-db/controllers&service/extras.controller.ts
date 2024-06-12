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
import { ExtraService } from './extras.service';
import { CreateExtraDto } from '../dto/create-extra.dto';

@Controller('carta-directa-db')
export class ExtrasController {
  constructor(private readonly extrasService: ExtraService) {}

  @Get('getExtraById/:id')
  async getExtrasById(@Param('id') id: number) {
    try {
      const response = await this.extrasService.findByItemId(id);
      return ApiResponse.success('Get extras by item id sucessfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while geting extras by item id',
        error,
      );
    }
  }

  @Post('createExtra')
  async createExtra(@Body() body: CreateExtraDto) {
    try {
      const response = await this.extrasService.createExtra(body);
      return ApiResponse.success('Create extras sucessfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while creating extras', error);
    }
  }

  /*   @Post('migrateExtra')
  async migrateExtra() {
    try {
      const response = await this.extrasService.migrateExtras();
      return ApiResponse.success('Create extras sucessfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while creating extras', error);
    }
  } */
}
