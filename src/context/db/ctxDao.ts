// import { PaginationMessageDto } from '../dto/pagination.dto';
import { UpdateCtxDto } from 'src/bot/dto';
import { Ctx } from '../entities/ctx.entity';
import { GetCtxByChatbotNumberDto } from '../dto/get-ctx-by-chatbotnumber.dto';

export interface ICtxDao {
  // create(createDoctoDto: CreateDoctorDto): Promise<Doctor>;

  findAll(props?: any): Promise<Array<Ctx>>;

  // findAllByPagination(paginationMessageDto: PaginationMessageDto): Promise<{ data: Message[]; total: number }>;

  // findById(id: string): Promise<Doctor>;

  findOrCreate(clientPhone: string, chatBotNumber: string): Promise<Ctx>;

  updateCtx(id: string, updateCtxDto: UpdateCtxDto): Promise<Ctx>;

  updateStatusByAppId(
    appointmentId: string,
    updateMessageDto: UpdateCtxDto,
  ): Promise<Ctx>;

  findByOrder(orderId: string): Promise<Ctx>;
  // findMessageByterm(term: string): Promise<Ctx>;

  // remove(id: string): Promise<Doctor>;
  remove(clientPhone?: string): Promise<void>;
  resetAllCtx(): Promise<void>;

  getCtxesByChatbotNumber(
    chatbotNumber: string,
    query: GetCtxByChatbotNumberDto,
  ): Promise<Array<Ctx>>;
}
