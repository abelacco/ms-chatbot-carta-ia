import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { Ctx } from '../entities/ctx.entity';
import { ICtxDao } from './ctxDao';
// import { PaginationMessageDto } from '../dto/pagination.dto';
import { mongoExceptionHandler } from 'src/common/exceptions';
import { PAYMENTSTATUS } from '../helpers/constants';
import { UpdateCtxDto } from 'src/bot/dto';

@Injectable()
export class MongoDbService implements ICtxDao {
  constructor(@InjectModel(Ctx.name) private readonly _ctxModel: Model<Ctx>) {}

  async findOrCreate(clientPhone: string): Promise<Ctx> {
    try {
      const ctx = await this._ctxModel.findOne({
        clientPhone: clientPhone,
      });

      if (!ctx) {
        try {
          const createMessage = new this._ctxModel({
            clientPhone: clientPhone,
          });
          await createMessage.save();
          return createMessage;
        } catch (error) {
          // logger.error(error);
          throw new InternalServerErrorException('Error creating message');
        }
      }

      return ctx;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }
  async updateCtx(id: string, updateCtxDto: UpdateCtxDto): Promise<Ctx> {
    try {
      const updatedMessage = await this._ctxModel.findByIdAndUpdate(
        id,
        updateCtxDto,
        { new: true },
      );
      return updatedMessage;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async updateStatusByAppId(
    appointmentId: string,
    updateCtxDto: UpdateCtxDto,
  ): Promise<Ctx> {
    try {
      const updatedMessage = await this._ctxModel.findOneAndUpdate(
        { appointmentId }, // criterio de búsqueda
        { $set: { status: updateCtxDto.status, code: updateCtxDto.code } }, // actualización
        { new: true }, // opciones para devolver el documento actualizado
      );
      return updatedMessage;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  // async findMessageByterm(term: string): Promise<Ctx> {
  //   try{
  //     const message = await this._ctxModel.findOne({term});
  //     return message;
  //   }
  //   catch(error){
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }
  // async findAllByPagination(paginationMessageDto: PaginationMessageDto): Promise<{data: Message[] ; total:number}> {
  //   try {
  //     // Construir el objeto de consulta
  //     const query = {};
  //     if (paginationMessageDto.phone) {
  //       query['phone'] = { $regex: paginationMessageDto.phone, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
  //     }
  //     if (paginationMessageDto.clientName) {
  //       query['clientName'] = { $regex: paginationMessageDto.clientName, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
  //     }

  //     // Aplicar paginación
  //     const limit = paginationMessageDto.limit || 10; // Valor por defecto si no se proporciona
  //     const offset = paginationMessageDto.offset || 0;

  //     // Realizar la consulta con filtros y paginación
  //     const data = await this._ctxModel.find(query).sort({ _id: -1 }).limit(limit).skip(offset);
  //     // Obtener el conteo total de documentos que coinciden con los criterios de búsqueda
  //     const total = await this._ctxModel.countDocuments(query);

  //     return {data, total};
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
  //   try {
  //     const createDoctor = new this._doctorModel(createDoctorDto);
  //     await createDoctor.save();
  //     return createDoctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  async findAll(props?: any): Promise<Array<Ctx>> {
    try {
      const QUERY = {};

      // if(props.name) {
      //   QUERY["clientPhone"] = { $regex: props.name, $options: 'i' };
      // }

      // if(props.phone) {
      //   QUERY["phone"] = props.phone;
      // }

      // if(props.speciality) {
      //   QUERY["speciality"] = { $regex: props.speciality, $options: 'i' };
      // }
      // if(!isNaN(props.modality)) {
      //   QUERY["modality"] = props.modality;
      // }

      const results = await this._ctxModel.find(QUERY);

      return results;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  // async findByName(name: string): Promise<Doctor> {
  //   try {
  //     const findDoctor: Doctor = await this._messageModel.findOne({ name });
  //     if (!findDoctor) throw new NotFoundException('doctor not found!');
  //     return findDoctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async findById(id: string): Promise<Doctor> {
  //   try {
  //     const doctor = await this._doctorModel.findById(id);
  //     return doctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
  //   try {
  //     const doctor = await this._doctorModel.findByIdAndUpdate(
  //       id,
  //       updateDoctorDto,
  //     );
  //     return doctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async remove(id: string): Promise<Doctor> {
  //   try {
  //     const doctor = await this._doctorModel.findByIdAndDelete(id);
  //     return doctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }
}
