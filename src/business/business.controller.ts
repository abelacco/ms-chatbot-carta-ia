import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BusinessService } from './business.service';
import {
  CreateBusinessDto,
  LoginBusinessDto,
  UpdateMetaAccess,
  UpdatePaymentMethodDto,
} from './dto';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('business')
export default class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('create')
  async createBusiness(@Body() createBusinessDto: CreateBusinessDto) {
    try {
      const response = await this.businessService.createBusiness(
        createBusinessDto,
      );
      return ApiResponse.success('Business created successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while creating business',
        error,
      );
    }
  }

  @Post('login')
  async loginBusiness(@Body() loginBusinessDto: LoginBusinessDto) {
    try {
      const response = await this.businessService.loginBusiness(
        loginBusinessDto,
      );
      return ApiResponse.success('Login successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while logging', error);
    }
  }

  @Post('migrate-one-restaurant/:id')
  async migrateOneRestaurant(@Param('id') id: number) {
    try {
      const response = await this.businessService.migrateOneRestaurant(id);
      return ApiResponse.success('Migrate successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while migrating', error);
    }
  }

  @Post('migrate-restaurants')
  async migrateRestaurants() {
    try {
      const response = await this.businessService.migrateRestaurants();
      return ApiResponse.success('Migrate successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while migrating', error);
    }
  }

  @Get('get-business/:term')
  async getBusiness(@Param('term') term: string) {
    try {
      const response = await this.businessService.getBusiness(term);
      return ApiResponse.success('Get business successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while geting business', error);
    }
  }

  @Put('update-meta-access/:id')
  async updateMetadata(
    @Param('id') id: string,
    @Body() updateMetaAccess: UpdateMetaAccess,
  ) {
    try {
      const response = await this.businessService.updateMetadata(
        id,
        updateMetaAccess,
      );
      return ApiResponse.success('Update meta access successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while updating meta access',
        error,
      );
    }
  }

  @Put('change-payment-method')
  async changePaymentMethod(@Body() body: UpdatePaymentMethodDto) {
    try {
      const response = await this.businessService.changePaymentMethod(body);
      return ApiResponse.success(
        'Change payment method successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while changing payment method',
        error,
      );
    }
  }

  @Put('update-coverage/:id')
  async updateCoverage(@Param('id') id: string) {
    try {
      const response = await this.businessService.updateCoverage(id);
      return ApiResponse.success('Updated coverage successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while updating coverage',
        error,
      );
    }
  }

  @Put('update-opening-hours/:id')
  async updateOpeningHours(@Param('id') id: string) {
    try {
      const response = await this.businessService.updateOpeningHours(id);
      return ApiResponse.success(
        'Updated opening hours successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while updating opening hours',
        error,
      );
    }
  }
}
