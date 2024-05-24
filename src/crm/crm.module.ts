import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { BuilderTemplatesModule } from 'src/builder-templates/builder-templates.module';
import { SenderModule } from 'src/sender/sender.module';
import { CtxController } from 'src/context/ctx.controller';
import { CtxModule } from 'src/context/ctx.module';
import { BusinessModule } from 'src/business/business.module';

@Module({
  controllers: [CrmController],
  providers: [CrmService],
  imports: [BuilderTemplatesModule, SenderModule, CtxModule, BusinessModule],
})
export class CrmModule {}
