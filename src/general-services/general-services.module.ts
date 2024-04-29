import { Module } from '@nestjs/common';
import { GeneralServicesService } from './general-services.service';
import { GeneralServicesController } from './general-services.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  controllers: [GeneralServicesController],
  providers: [GeneralServicesService, CloudinaryProvider],
  exports: [GeneralServicesService],
})
export class GeneralServicesModule {}
