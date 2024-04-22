import { Module } from '@nestjs/common';
import { WhatsappGateway } from './wsp-web-gateway.gateway';

@Module({
  providers: [WhatsappGateway],
  exports: [WhatsappGateway],
})
export class WspWebGatewayModule {}
