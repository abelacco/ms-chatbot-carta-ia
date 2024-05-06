import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import BusinessController from './business.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongoDbService } from './db/mongodb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './entity';

@Module({
  controllers: [BusinessController],
  providers: [BusinessService, MongoDbService],
  exports: [BusinessService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Business.name,
        schema: BusinessSchema,
      },
    ]),
  ],
})
export class BusinessModule {}
