import { Controller, Get, Query } from '@nestjs/common';
import { CtxService } from './ctx.service';

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
}
