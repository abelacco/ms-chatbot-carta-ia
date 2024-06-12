import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtrasListEntity } from '../entities/extra.list.entity';
import { CreateExtraInListDto } from '../dto/create-extra-in-list.dto';

@Injectable()
export class ExtraListService {
  constructor(
    @InjectRepository(ExtrasListEntity)
    private readonly extrasListRepository: Repository<ExtrasListEntity>,
  ) {}

  async createExtraInList(body: CreateExtraInListDto) {
    const extra = await this.extrasListRepository.findOne({
      where: { name: body.name, extra_group_id: body.extra_group_id },
    });

    if (extra) {
      throw new BadRequestException(
        `Extra with name ${body.name} and extra group id ${body.extra_group_id} already exist`,
      );
    }

    const newExtra = this.extrasListRepository.create({
      extra_group_id: body.extra_group_id,
      name: body.name,
      price: body.price,
    });

    const extraSaved = await this.extrasListRepository.save(newExtra);

    return extraSaved;
  }

  async getExtrasByGroup(groupId: number) {
    const extras = await this.extrasListRepository.find({
      where: {
        extra_group_id: groupId,
      },
    });

    return extras;
  }

  async createOrUpdateExtraInList(body: CreateExtraInListDto) {
    let extra = await this.extrasListRepository.findOne({
      where: { name: body.name, extra_group_id: body.extra_group_id },
    });

    if (extra) {
      extra.price = body.price;
      extra.name = body.name;
    } else {
      extra = this.extrasListRepository.create(body);
    }

    return this.extrasListRepository.save(extra);
  }
}
