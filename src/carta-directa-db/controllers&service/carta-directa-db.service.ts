import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompanyEntity, OpeningHoursEntity } from '../entities';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleDeliveryAreasEntity } from '../entities/simple-delivery-areas.entity';
import { UserEntity } from '../entities/user.entity';
import { CoverageFromXlsxToDbDto } from '../dto';
import { xlsxToJson } from '../helpers/readXlsx';
import { readFile } from 'xlsx';
import { readFileSync } from 'fs';

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

  async coverageFromXlsxToDb(body: CoverageFromXlsxToDbDto) {
    /* Si se va a leer desde archivos locales comentar esta linea y descomentar las comentadas */
    const jsonData = xlsxToJson(body.xlsxFile);

    /*     const fileBuffer = readFileSync(
      process.cwd() + '/src/carta-directa-db/franki.xlsx',
    );
    const jsonData = xlsxToJson(Buffer.from(fileBuffer).toString('base64')); */

    if (jsonData.length === 0) {
      throw new BadRequestException('File xlsx is invalid');
    }

    const allHasAreaAndPrice = jsonData.every(
      (objeto: any) => 'area' in objeto && 'price' in objeto,
    );

    if (!allHasAreaAndPrice) {
      throw new BadRequestException("File xlsx don't has price or area cell ");
    }

    try {
      jsonData.forEach(async (item: any) => {
        const existingDeliveryArea = await this.deliveryAreasRepository.findOne(
          {
            where: {
              name: item.area,
              restaurant_id: body.restaurantId,
            },
          },
        );

        if (existingDeliveryArea) {
          existingDeliveryArea.cost = item.price;
          existingDeliveryArea.updated_at = new Date();
          await this.deliveryAreasRepository.save(existingDeliveryArea);
        } else {
          const newDeliveryArea = new SimpleDeliveryAreasEntity();
          newDeliveryArea.name = item.area;
          newDeliveryArea.cost = item.price;
          newDeliveryArea.restaurant_id = body.restaurantId;
          newDeliveryArea.created_at = new Date();
          newDeliveryArea.updated_at = new Date();
          await this.deliveryAreasRepository.save(newDeliveryArea);
        }
      });
      return 'sucess';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}