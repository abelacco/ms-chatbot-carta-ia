// CartaDirectaDbModule
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  CompanyEntity,
  ExtraEntity,
  ItemEntity,
  OpeningHoursEntity,
  VariantsGroupEntity,
} from './entities';
import { SimpleDeliveryAreasEntity } from './entities/simple-delivery-areas.entity';
import { UserEntity } from './entities/user.entity';
import { CartaDirectaDbService } from './controllers&service/carta-directa-db.service';
import { CartaDirectaDbController } from './controllers&service/carta-directa-db.controller';
import { VariantGroupController } from './controllers&service/variant-group.controller';
import { VariantGroupService } from './controllers&service/variant-group.service';
import { ItemController } from './controllers&service/item.controller';
import { ItemService } from './controllers&service/item.service';
import { CategoryService } from './controllers&service/category.service';
import { CategoryController } from './controllers&service/category.controller';
import { ExtraListService } from './controllers&service/extras-list.service';
import { ExtrasListController } from './controllers&service/extras-list.controller';
import { ExtrasListEntity } from './entities/extra.list.entity';
import { ExtrasController } from './controllers&service/extras.controller';
import { ExtraService } from './controllers&service/extras.service';

@Module({
  exports: [CartaDirectaDbService],
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('mysqlHost'),
        port: config.get('mysqlPort'),
        username: config.get('mysqlUsername'),
        password: config.get('mysqlPassword'),
        database: config.get('mysqlDatabase'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        // synchronize: config.get('TYPEORM_SYNC'), // Usa con precaución
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      CompanyEntity,
      SimpleDeliveryAreasEntity,
      OpeningHoursEntity,
      UserEntity,
      VariantsGroupEntity,
      ItemEntity,
      CategoryEntity,
      ExtrasListEntity,
      ExtraEntity,
    ]),
  ],
  controllers: [
    CartaDirectaDbController,
    VariantGroupController,
    ItemController,
    CategoryController,
    ExtrasListController,
    ExtrasController,
  ],
  providers: [
    CartaDirectaDbService,
    VariantGroupService,
    ItemService,
    CategoryService,
    ExtraListService,
    ExtraService,
  ],
})
export class CartaDirectaDbModule {}
