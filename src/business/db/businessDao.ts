// import { PaginationMessageDto } from '../dto/pagination.dto';

import { CreateBusinessDto, UpdateBusinessDto, UpdateMetaAccess } from '../dto';
import { Business } from '../entity/business.entity';

export interface IBusinessDao {
  create(createBusinessDto: CreateBusinessDto): Promise<Business>;

  findOne(term: string): Promise<Business>;

  updateBusiness(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business>;

  updateMetaAccess(
    id: string,
    UupdateMetaAccess: UpdateMetaAccess,
  ): Promise<Business>;
}
