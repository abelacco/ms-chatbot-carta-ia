import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './entities/history.entity';
import { MongoDbService } from './db/mongodb.service';

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
  ],
  exports: [HistoryService],
})
export class HistoryModule {}
