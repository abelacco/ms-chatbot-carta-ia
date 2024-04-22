
// import { PaginationMessageDto } from '../dto/pagination.dto';
import { UpdateCtxDto } from 'src/bot/dto';
import { Ctx } from '../entities/ctx.entity';

export interface ICtxDao {


  // create(createDoctoDto: CreateDoctorDto): Promise<Doctor>;

  findAll(props?: any): Promise<Array<Ctx>>;
    
  // findAllByPagination(paginationMessageDto: PaginationMessageDto): Promise<{ data: Message[]; total: number }>;

  // findById(id: string): Promise<Doctor>;

  findOrCreate(clientPhone: string): Promise<Ctx>;

  updateCtx(id: string, updateCtxDto: UpdateCtxDto): Promise<Ctx>;

  updateStatusByAppId(appointmentId: string , updateMessageDto: UpdateCtxDto): Promise<Ctx>;

  // findMessageByterm(term: string): Promise<Ctx>;

  // remove(id: string): Promise<Doctor>;
}
