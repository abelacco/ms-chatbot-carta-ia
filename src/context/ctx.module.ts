import { Module } from '@nestjs/common';
import { CtxService } from './ctx.service';
import { CtxController } from './ctx.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ctx, CtxSchema } from './entities/ctx.entity';
import { MongoDbService } from './db/mongodb.service';

@Module({
  controllers: [CtxController],
  providers: [CtxService, MongoDbService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Ctx.name,
        schema: CtxSchema,
      },
    ]),
  ],
  exports: [CtxService, MongoDbService],
})
export class CtxModule {}
