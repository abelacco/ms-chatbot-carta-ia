import { Controller, Get, Query, Put } from '@nestjs/common';
import { CtxService } from './ctx.service';
import { SwitchBotDto, SwitchBotGlobalDto, UpdateOrderStatusDto } from './dto';
import { ApiResponse } from 'src/common/ApiResponses';

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
}
