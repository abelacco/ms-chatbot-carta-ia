import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VariantsGroupEntity } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVariantGroupDto, UpdateVariantGroupDto } from '../dto';
import { CartaDirectaDbService } from '../controllers&service/carta-directa-db.service';

@Injectable()
export class VariantGroupService {
  constructor(
    @InjectRepository(VariantsGroupEntity)
    private readonly variantsGroupRepository: Repository<VariantsGroupEntity>,
    private readonly cartaDirectaDbService: CartaDirectaDbService,
  ) {}

  async createVariantGroup(body: CreateVariantGroupDto) {
    try {
      const company = await this.cartaDirectaDbService.findOneCompany(
        body.restaurant_id,
      );
      if (!company) {
        throw new NotFoundException(`Company ${body.restaurant_id} not found`);
      }

      const newVariantsGroup = new VariantsGroupEntity();
      newVariantsGroup.category_name = body.category_name;
      newVariantsGroup.restaurant_id = BigInt(body.restaurant_id);

      const savedVariantGroup = await this.variantsGroupRepository.save(
        newVariantsGroup,
      );

      return {
        ...savedVariantGroup,
        restaurant_id: savedVariantGroup.restaurant_id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteVariantGroup(id: number) {
    try {
      const updateResult = await this.variantsGroupRepository.update(id, {
        deleted_at: new Date(),
      });

      return updateResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateVarianGroup(id: number, body: UpdateVariantGroupDto) {
    try {
      const variantGroup = await this.variantsGroupRepository.findOne({
        where: {
          id: BigInt(id),
        },
      });
      if (!variantGroup) {
        throw new NotFoundException(`Varian group: ${id} not exist`);
      }

      variantGroup.category_name = body.category_name;
      await this.variantsGroupRepository.save(variantGroup);

      return variantGroup;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findVariantsGroupsByCompany(companyId: number) {
    try {
      const variantGroup = await this.variantsGroupRepository.find({
        where: {
          restaurant_id: BigInt(companyId),
        },
      });

      return variantGroup;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
