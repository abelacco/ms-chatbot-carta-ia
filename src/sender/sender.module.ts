import { Module } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderController } from './sender.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { WspWebGatewayModule } from 'src/wsp-web-gateway/wsp-web-gateway.module';

@Module({
  controllers: [SenderController],
  imports: [WspWebGatewayModule, BuilderTemplatesModule],
  providers: [SenderService],
  exports: [SenderService],
})
export class SenderModule {}
