import { Module } from '@nestjs/common';
import { CartaDirectaDataController } from './carta-directa-data.controller';
import { CartaDirectaDataService } from './carta-directa-data.service';

@Module({
  providers: [CartaDirectaDataService], // El servicio que provee la lógica
  controllers: [CartaDirectaDataController], // El controlador que maneja las rutas HTTP
})
export class CartaDirectaDataModule {}
