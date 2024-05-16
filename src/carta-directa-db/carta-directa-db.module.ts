import { Module } from '@nestjs/common';
import { CartaDirectaDbService } from './carta-directa-db.service';
import { CartaDirectaDbController } from './carta-directa-db.controller';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity, OpeningHoursEntity } from './entities';
import { SimpleDeliveryAreasEntity } from './entities/simple-delivery-areas.entity';
import { UserEntity } from './entities/user.entity';

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
    ]),
  ],
  controllers: [CartaDirectaDbController],
  providers: [CartaDirectaDbService],
})
export class CartaDirectaDbModule {}
