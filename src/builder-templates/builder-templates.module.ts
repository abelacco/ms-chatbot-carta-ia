import { Module } from '@nestjs/common';
import { BuilderTemplatesService } from './builder-templates.service';
import { BuilderTemplatesController } from './builder-templates.controller';
import { SenderModule } from 'src/sender/sender.module';

@Module({
  controllers: [BuilderTemplatesController],
  providers: [BuilderTemplatesService],
  exports: [BuilderTemplatesService],
  imports: [SenderModule],
})
export class BuilderTemplatesModule {}
