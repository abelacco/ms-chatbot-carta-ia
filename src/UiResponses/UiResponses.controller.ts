import { Body, Controller, Post } from '@nestjs/common';
import { UiResponsesService } from './UiResponses.service';
import {
  NotifyDeliveryDto,
  ResponseOrderStatusDto,
  ResponseToLocationDto,
  ResponseToVoucherDto,
} from './dtos';

@Controller('ui-response')
export default class UiResponseController {
  constructor(private readonly uiResponseService: UiResponsesService) {}

  @Post('location')
  responseToLocation(@Body() body: ResponseToLocationDto) {
    return this.uiResponseService.responseToLocation(body);
  }

  @Post('voucher')
  responseToVoucher(@Body() body: ResponseToVoucherDto) {
    return this.uiResponseService.responseToVoucher(body);
  }

  @Post('order-status')
  responseOrderStatus(@Body() body: ResponseOrderStatusDto) {
    return this.uiResponseService.responseOrderStatus(body);
  }

  @Post('notify-delivery')
  notifyDelivery(@Body() body: NotifyDeliveryDto) {
    return this.uiResponseService.notifyDelivery(body);
  }
}
