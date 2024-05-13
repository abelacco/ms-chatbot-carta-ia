import { Body, Controller, Post } from '@nestjs/common';
import { UiResponsesService } from './UiResponses.service';
import {
  ResponseOrderStatusDto,
  ResponseToLocationDto,
  ResponseToVoucherDto,
} from './dtos';
import { ApiResponse } from 'src/common/ApiResponses';

@Controller('ui-response')
export default class UiResponseController {
  constructor(private readonly uiResponseService: UiResponsesService) {}

  @Post('location')
  async responseToLocation(@Body() body: ResponseToLocationDto) {
    try {
      const response = await this.uiResponseService.responseToLocation(body);
      return ApiResponse.success('Successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while responding to location',
        error,
      );
    }
  }

  @Post('voucher')
  async responseToVoucher(@Body() body: ResponseToVoucherDto) {
    try {
      const response = await this.uiResponseService.responseToVoucher(body);
      return ApiResponse.success('Successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error occurred while responding voucher',
        error,
      );
    }
  }

  @Post('order-status')
  async responseOrderStatus(@Body() body: ResponseOrderStatusDto) {
    try {
      const response = await this.uiResponseService.responseOrderStatus(body);
      return ApiResponse.success('Successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error occurred while changing order status',
        error,
      );
    }
  }
}
