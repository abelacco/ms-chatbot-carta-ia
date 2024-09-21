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
import { CategoryService } from './category.service';
import { ItemService } from './item.service';
import { ExtraService } from './extras.service';
import { ICompany } from '../interfaces/companies.interfaces';
import { parse } from 'path';
import { parseCompany } from '../utils/parseCompany';

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
    private readonly categoryService: CategoryService,
    private readonly itemService: ItemService,
    private readonly extraService: ExtraService,
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
    /* const jsonData = xlsxToJson(body.xlsxFile, 0); */

    const fileBuffer = readFileSync(
      process.cwd() + '/src/carta-directa-db/Delivery_Areas.xlsx',
    );
    const jsonData = xlsxToJson(Buffer.from(fileBuffer).toString('base64'), 0);

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

  async menuFromXlsxToDb(companyId: number) {
    /* Si se va a leer desde archivos locales comentar esta linea y descomentar las comentadas */
    /* const jsonData = xlsxToJson(body.xlsxFile); */

    const fileBuffer = readFileSync(
      process.cwd() + '/src/carta-directa-db/Menu_test.xlsx',
    );
    const menuJsonData: any = xlsxToJson(
      Buffer.from(fileBuffer).toString('base64'),
      0,
    );
    const extrasJsonData: any = xlsxToJson(
      Buffer.from(fileBuffer).toString('base64'),
      1,
    );

    /* Recorre los items del menu */
    for (const menuItem of menuJsonData) {
      /* Hace un array de extras */
      let itemExtraArray: any;
      if (menuItem.extras) {
        itemExtraArray = menuItem.extras.split(', ');
      }

      /* Verifica si la categoría existe si no la crea */
      let category = await this.categoryService.findByNameAndCompanyId(
        menuItem.categoria,
        companyId,
      );
      if (!category) {
        category = await this.categoryService.create({
          name: menuItem.categoria,
          restorant_id: companyId,
        });
      }

      let item = await this.itemService.findItem({
        category_id: category.id,
        restaurant_id: companyId,
        itemName: menuItem.producto,
      });
      if (!item) {
        item = await this.itemService.create({
          restaurant_id: companyId,
          name: menuItem.producto,
          description: menuItem.descripcion,
          price: menuItem.precio,
          category_id: category.id,
          image: undefined,
        });
      }

      /* Recorre el array de extras */
      if (itemExtraArray) {
        for (const itemExtra of itemExtraArray) {
          /* Consigue la información del extra */
          const commonExtra = extrasJsonData.find((extra: any) => {
            return extra.nombre === itemExtra;
          });
          let extra = await this.extraService.findOneExtra(
            item.id,
            commonExtra.nombre,
          );
          if (!extra) {
            extra = await this.extraService.createExtra({
              item_id: item.id,
              price: commonExtra.precio,
              name: commonExtra.nombre,
            });
          }
        }
      }
    }

    try {
      return 'sucess';
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async webhookCartaDirecta(body: any) {
    try {
      const allCompanies = await this.findAllCompanies();
      console.log('Companies: ', allCompanies);

      // Usar .map() para parsear todos los elementos
      const parsedCompanies = allCompanies.map((company) =>
        parseCompany(company),
      );
      console.log('Parsed Companies: ', parsedCompanies);

      return parsedCompanies; // Devuelve las compañías parseadas
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
