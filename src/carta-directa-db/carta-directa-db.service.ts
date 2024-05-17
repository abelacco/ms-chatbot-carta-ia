import { Injectable } from '@nestjs/common';
import { CompanyEntity } from './entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CartaDirectaDbService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
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

  async findOneCompany(id: number): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: {
        id: id,
      },
    });
    return company;
  }

  update(id: number) {
    return `This action updates a #${id} cartaDirectaDb`;
  }

  remove(id: number) {
    return `This action removes a #${id} cartaDirectaDb`;
  }
}
