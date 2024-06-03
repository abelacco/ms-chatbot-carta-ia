import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ItemEntity } from '../entities';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { FindItemsByCategoryIdDto } from '../dto';
import { CreateItemDto } from '../dto/create-item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    private readonly categoryService: CategoryService,
  ) {}

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
