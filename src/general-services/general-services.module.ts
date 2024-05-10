import { Module } from '@nestjs/common';
import { GeneralServicesService } from './general-services.service';
import { GeneralServicesController } from './general-services.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { BusinessModule } from 'src/business/business.module';

@Module({
  controllers: [GeneralServicesController],
  providers: [GeneralServicesService, CloudinaryProvider],
  imports: [BusinessModule],
  exports: [GeneralServicesService],
})
export class GeneralServicesModule {}
