import { Module } from '@nestjs/common';
import { CartaDirectaService } from './cartaDirecta.service';
import { CartaDirectaController } from './cartaDirecta.controller';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';

@Module({
  controllers: [CartaDirectaController],
  providers: [CartaDirectaService],
  imports: [AuthModule, BusinessModule],
  exports: [CartaDirectaService],
})
export class CartaDirectaModule {}
