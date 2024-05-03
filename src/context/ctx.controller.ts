import { Controller, Get, Query, Put } from '@nestjs/common';
import { CtxService } from './ctx.service';
import { SwitchBotDto, SwitchBotGlobalDto, UpdateOrderStatusDto } from './dto';

@Controller('ctx')
export class CtxController {
  constructor(private readonly ctxService: CtxService) {}

  @Get('get-ctx')
  findAll(
    @Query('clientPhone') clientPhone: string,
    @Query('chatbotNumber') chatbotNumber: string,
  ) {
    return this.ctxService.findAllCtx();
  }

  @Put('switch-bot')
  switchBot(@Query() switchBot: SwitchBotDto) {
    return this.ctxService.switchBotCtx(switchBot);
  }

  @Put('switch-bot-global')
  switchBotGlobalDto(@Query() switchBot: SwitchBotGlobalDto) {
    return this.ctxService.switchBotGlobalCtx(switchBot);
  }

  @Put('update-status-order')
  updateStatusOrder(@Query() updateOrder: UpdateOrderStatusDto) {
    return this.ctxService.updateStatusOrder(updateOrder);
  }
}
