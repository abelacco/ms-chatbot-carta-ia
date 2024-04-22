import { Module } from '@nestjs/common';
import { WspWebHookService } from './wsp-web-hook.service';
import { WspWebHookController } from './wsp-web-hook.controller';
import { BotModule } from 'src/bot/bot.module';
import { WspWebGatewayModule } from 'src/wsp-web-gateway/wsp-web-gateway.module';

@Module({
  imports: [BotModule, WspWebGatewayModule],
  controllers: [WspWebHookController],
  providers: [WspWebHookService],
})
export class WspWebHookModule {}
