import { Module } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { FlowsController } from './flows.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { CtxModule } from 'src/context/ctx.module';
import { SenderModule } from 'src/sender/sender.module';
import { AiModule } from 'src/ai/ai.module';
import { HistoryModule } from 'src/history/history.module';

@Module({
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService],
  imports: [
    CtxModule,
    BuilderTemplatesModule,
    SenderModule,
    AiModule,
    HistoryModule,
  ],
})
export class FlowsModule {}
