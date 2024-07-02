import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './entities/history.entity';
import { MongoDbService } from './db/mongodb.service';
import { GeneralServicesModule } from 'src/general-services/general-services.module';
import { CtxModule } from 'src/context/ctx.module';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, MongoDbService],
  imports: [
    MongooseModule.forFeature([
      {
        name: History.name,
        schema: HistorySchema,
      },
    ]),
    GeneralServicesModule,
    CtxModule,
  ],
  exports: [HistoryService],
})
export class HistoryModule {}
