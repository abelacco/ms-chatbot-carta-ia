import { Module } from '@nestjs/common';
import { CartaDirectaService } from './cartaDirecta.service';
import { CartaDirectaController } from './cartaDirecta.controller';

@Module({
  controllers: [CartaDirectaController],
  providers: [CartaDirectaService],
  exports: [CartaDirectaService],
})
export class CartaDirectaModule {}
