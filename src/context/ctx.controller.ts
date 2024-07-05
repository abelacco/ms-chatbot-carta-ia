import {
  Controller,
  Get,
  Query,
  Put,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { CtxService } from './ctx.service';
import { SwitchBotDto, SwitchBotGlobalDto, UpdateOrderStatusDto } from './dto';
import { ApiResponse } from 'src/common/ApiResponses';
import { CancelHelpDto } from './dto/cancel-help.dto';
import { ManualOrderDto } from './dto/manual-order.dto';
import { query } from 'express';
import { GetCtxByChatbotNumberDto } from './dto/get-ctx-by-chatbotnumber.dto';

@Controller('ctx')
export class CtxController {
  constructor(private readonly ctxService: CtxService) {}

  @Get('get-ctx')
  async findAll(
    @Query('clientPhone') clientPhone: string,
    @Query('chatbotNumber') chatbotNumber: string,
  ) {
    try {
      const response = await this.ctxService.findAllCtx();
      return ApiResponse.success('Find all ctx successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while finding all ctx', error);
    }
  }

  @Put('switch-bot')
  async switchBot(@Query() switchBot: SwitchBotDto) {
    try {
      const response = await this.ctxService.switchBotCtx(switchBot);
      return ApiResponse.success('Switch bot successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while switching bot', error);
    }
  }

  @Put('switch-bot-global')
  async switchBotGlobalDto(@Query() switchBot: SwitchBotGlobalDto) {
    try {
      const response = await this.ctxService.switchBotGlobalCtx(switchBot);
      return ApiResponse.success('Switch global bot successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while switching global bot',
        error,
      );
    }
  }

  @Put('update-status-order')
  async updateStatusOrder(@Query() updateOrder: UpdateOrderStatusDto) {
    try {
      const response = await this.ctxService.updateStatusOrder(updateOrder);
      return ApiResponse.success('Update status order successfully', response);
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while updating status order',
        error,
      );
    }
  }

  @Put('cancel-help')
  async cancelHelp(@Body() body: CancelHelpDto) {
    try {
      const response = await this.ctxService.cancelHelpStatus(body);
      return ApiResponse.success('Cancel help successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while canceling help', error);
    }
  }

  @Delete('delete-ctx')
  async deleteCtx() {
    try {
      const response = await this.ctxService.remove();
      return ApiResponse.success('Delete ctxes successfully', response);
    } catch (error) {
      return ApiResponse.error('An error ocurred while deleting ctxes', error);
    }
  }

  @Get('ctx-by-chatbot-number/:id')
  async getCtxByChatbotNumber(
    @Param('id') orderId: string,
    @Query() query: GetCtxByChatbotNumberDto,
  ) {
    try {
      console.log('orderId', orderId);
      const response = await this.ctxService.getCtxesByChatbotNumber(
        orderId,
        query,
      );
      return ApiResponse.success(
        'Get all ctx by chatbot number successfully',
        response,
      );
    } catch (error) {
      return ApiResponse.error(
        'An error ocurred while geting all ctx by chatbot number',
        error,
      );
    }
  }
}
