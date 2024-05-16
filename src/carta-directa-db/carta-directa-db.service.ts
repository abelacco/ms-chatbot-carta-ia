import { Injectable } from '@nestjs/common';
import { CompanyEntity, OpeningHoursEntity } from './entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleDeliveryAreasEntity } from './entities/simple-delivery-areas.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class CartaDirectaDbService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    @InjectRepository(SimpleDeliveryAreasEntity)
    private readonly deliveryAreasRepository: Repository<SimpleDeliveryAreasEntity>,
    @InjectRepository(OpeningHoursEntity)
    private readonly openingHoursEntityRepository: Repository<OpeningHoursEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
  ) {}

  create() {
    return 'This action adds a new cartaDirectaDb';
  }

  async findAllCompanies(): Promise<CompanyEntity[]> {
    return await this.companyRepository.find();
  }

  async findCompanyCoverage(
    restaurantId: number,
  ): Promise<SimpleDeliveryAreasEntity[]> {
    return await this.deliveryAreasRepository.find({
      where: {
        restaurant_id: restaurantId,
      },
    });
  }

  async findCompanyOpeningHours(
    restaurantId: number,
  ): Promise<OpeningHoursEntity> {
    return await this.openingHoursEntityRepository.findOne({
      where: {
        restorant_id: restaurantId,
      },
    });
  }

  async findUser(userId: number): Promise<UserEntity> {
    return await this.userEntityRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} cartaDirectaDb`;
  }

  update(id: number) {
    return `This action updates a #${id} cartaDirectaDb`;
  }

  remove(id: number) {
    return `This action removes a #${id} cartaDirectaDb`;
  }
}
