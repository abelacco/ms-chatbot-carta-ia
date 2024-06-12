import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryEntity } from '../entities';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findByCompanyId(companyId: number) {
    const categories = await this.categoryRepository.find({
      where: {
        restorant_id: companyId,
        deleted_at: IsNull(),
      },
      relations: ['items', 'items.extras'],
    });

    return categories;
  }

  async create(Body: CreateCategoryDto) {
    const categoryExist = await this.findByNameAndCompanyId(
      Body.name,
      Body.restorant_id,
    );

    if (categoryExist) {
      throw new BadRequestException(
        `Category with name ${Body.name} already exist in restaurant with id ${Body.restorant_id}`,
      );
    }

    const category = await this.categoryRepository.save({
      ...Body,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return category;
  }

  async findByNameAndCompanyId(categoryName: string, companyId: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        restorant_id: companyId,
        name: categoryName,
      },
    });

    return category;
  }

  async findByCategoryIdAndCompanyId(categoryId: number, companyId: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        restorant_id: companyId,
        id: categoryId,
      },
    });

    return category;
  }
}
