import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtraEntity } from '../entities';
import { CreateExtraDto } from '../dto/create-extra.dto';
import { CategoryService } from './category.service';

@Injectable()
export class ExtraService {
  constructor(
    @InjectRepository(ExtraEntity)
    private readonly extrasRepository: Repository<ExtraEntity>,
    private readonly categoryService: CategoryService,
  ) {}

  async findByItemId(itemId: number) {
    return this.extrasRepository.find();
  }

  async findOneExtra(itemId: number, extraName: string) {
    return this.extrasRepository.findOne({
      where: {
        item_id: itemId,
        deleted_at: IsNull(),
        name: extraName,
      },
    });
  }

  async createExtra(createExtraDto: CreateExtraDto) {
    const newExtra = this.extrasRepository.create(createExtraDto);
    return this.extrasRepository.save(newExtra);
  }

  /*   async migrateExtras() {
    const extrasArray = [
      { name: 'PLATANO', price: 6.0 },
      { name: 'SALSA BBQ', price: 4.0 },
      { name: 'ENSALADA SALÓN', price: 11.0 },
      { name: 'ENSALADA DELIVERY', price: 14.0 },
      { name: 'SALSA DE PICKLES', price: 5.0 },
      { name: 'PICO DE GALLO', price: 4.0 },
      { name: 'SALSA HONEY ROCOTO', price: 6.0 },
      { name: 'SALSA HONEY MUSTARD', price: 4.0 },
      { name: 'SALSA ACEVICHARRO', price: 6.0 },
      { name: 'AJÍ DE LA CASA', price: 4.0 },
      { name: 'SALSA QUESO CHEDDAR', price: 9.0 },
      { name: 'MIX DE SALSAS', price: 3.0 },
      { name: 'MAYONESA', price: 0.0 },
      { name: 'KETCHUP', price: 0.0 },
      { name: 'MOSTAZA', price: 0.0 },
    ];

    
    const categories = await this.categoryService.findByCompanyId(49);
    categories.forEach((category) => {
      console.log('**********' + category.name);
      category.items.forEach((item) => {
        console.log(item.id);

        extrasArray.forEach(async (extra) => {
          console.log('   ' + extra.name + ' $' + extra.price);
          await this.createExtra({
            item_id: item.id,
            price: extra.price,
            name: extra.name,
          });
        });
      });
    });
  } */
}
