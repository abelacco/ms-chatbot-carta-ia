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
}
