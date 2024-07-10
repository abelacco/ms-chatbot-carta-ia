import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemEntity } from '../entities';
import { Brackets, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { FindItemsByCategoryIdDto } from '../dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { ResponseDB } from '../interface';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    private readonly categoryService: CategoryService,
  ) {}

  async searchItems(items: string[]): Promise<ResponseDB> {
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('category.company', 'company');

    // items.forEach((item, index) => {
    //   queryBuilder
    //     .orWhere('item.name LIKE :query' + index, {
    //       ['query' + index]: `%${item}%`,
    //     })
    //     .orWhere('item.description LIKE :query' + index, {
    //       ['query' + index]: `%${item}%`,
    //     });
    // });
    items.forEach((item, index) => {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('item.name LIKE :query' + index, {
            ['query' + index]: `%${item}%`,
          }).orWhere('item.description LIKE :query' + index, {
            ['query' + index]: `%${item}%`,
          });
        }),
      );
    });

    queryBuilder.select([
      'item.id',
      'item.name',
      'item.description',
      'item.price',
      'category.id',
      'category.name',
      'company.id',
      'company.name',
      'company.address',
      'company.phone',
    ]);

    const result = await queryBuilder.getRawMany();
    const total = await queryBuilder.getCount();
    return { result, total };
  }

  async findItemsByCategory(body: FindItemsByCategoryIdDto) {
    const foundedCategory =
      await this.categoryService.findByCategoryIdAndCompanyId(
        body.category_id,
        body.restaurant_id,
      );

    if (!foundedCategory) {
      throw new NotFoundException(
        `Category with id ${body.category_id} not exist in restaurant with id ${body.restaurant_id}`,
      );
    }

    const items = await this.itemRepository.find({
      where: {
        category_id: body.category_id,
        deleted_at: IsNull(),
      },
    });

    return items;
  }

  async findItem(body: { category_id; restaurant_id; itemName }) {
    const foundedCategory =
      await this.categoryService.findByCategoryIdAndCompanyId(
        body.category_id,
        body.restaurant_id,
      );

    if (!foundedCategory) {
      throw new NotFoundException(
        `Category with id ${body.category_id} not exist in restaurant with id ${body.restaurant_id}`,
      );
    }

    const items = await this.itemRepository.findOne({
      where: {
        category_id: body.category_id,
        name: body.itemName,
        deleted_at: IsNull(),
      },
    });

    return items;
  }

  async create(body: CreateItemDto) {
    const foundedCategory =
      await this.categoryService.findByCategoryIdAndCompanyId(
        body.category_id,
        body.restaurant_id,
      );

    if (!foundedCategory) {
      throw new NotFoundException(
        `Category with id ${body.category_id} not exist in restaurant with id ${body.restaurant_id}`,
      );
    }

    const newItem = this.itemRepository.create({
      name: body.name,
      description: body.description,
      image: body.image,
      price: body.price,
      category_id: body.category_id,
      created_at: new Date(),
      updated_at: new Date(),
      available: 1,
      has_variants: 0,
      vat: 21.0,
      deleted_at: null,
      enable_system_variants: 0,
      discounted_price: 0,
    });

    const category = await this.itemRepository.save(newItem);

    return category;
  }
}
