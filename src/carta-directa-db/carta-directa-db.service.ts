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
