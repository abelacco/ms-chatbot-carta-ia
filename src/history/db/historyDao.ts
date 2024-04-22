
// import { PaginationMessageDto } from '../dto/pagination.dto';

import { CreateHistoryDto } from "../dto";
import { History } from "../entities/history.entity";


export interface IHistoryDao {


  create(createHistory: CreateHistoryDto): Promise<History>;

  findAll(clientPhone:string , chatbotNumber:string): Promise<Array<History>>;
    
  
}
