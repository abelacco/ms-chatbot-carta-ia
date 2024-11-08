import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { Ctx } from '../entities/ctx.entity';
import { ICtxDao } from './ctxDao';
import { mongoExceptionHandler } from 'src/common/exceptions';
import { UpdateCtxDto } from 'src/bot/dto';
import { GetCtxByChatbotNumberDto } from '../dto/get-ctx-by-chatbotnumber.dto';

@Injectable()
export class MongoDbService implements ICtxDao {
  constructor(@InjectModel(Ctx.name) private readonly _ctxModel: Model<Ctx>) {}

  async findOrCreate(clientPhone: string, chatBotNumber: string): Promise<Ctx> {
    try {
      const ctx = await this._ctxModel.findOne({
        clientPhone: clientPhone,
        chatbotNumber: chatBotNumber,
      });

      if (!ctx) {
        try {
          const createMessage = new this._ctxModel({
            clientPhone: clientPhone,
            chatbotNumber: chatBotNumber,
            orderStatus: 0,
            help: 0,
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

  async findByOrder(orderId: string): Promise<Ctx> {
    try {
      const ctx = await this._ctxModel.findOne({
        currentOrderId: orderId,
      });

      return ctx;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async getCtxesByChatbotNumber(
    chatbotNumber: string,
    query: GetCtxByChatbotNumberDto,
  ): Promise<Array<Ctx>> {
    let startDateQuery: Date | undefined;
    let endDateQuery: Date | undefined;

    // Verificar y procesar startDate y endDate si existen en query
    if (query.startDate) {
      startDateQuery = new Date(query.startDate);
      startDateQuery.setUTCHours(5, 0, 0, 0); // Establecer a las 05:00:00 UTC

      if (query.endDate) {
        endDateQuery = new Date(query.endDate);
        endDateQuery.setDate(endDateQuery.getDate() + 1);
        endDateQuery.setUTCHours(4, 59, 59, 999); // Establecer a las 04:59:59.999 UTC
      } else {
        endDateQuery = new Date(startDateQuery);
        endDateQuery.setDate(endDateQuery.getDate() + 1);
        endDateQuery.setUTCHours(4, 59, 59, 999); // Establecer a las 04:59:59.999 UTC para el mismo día
      }
    }
    try {
      const mongoQuery: any = {};

      // Agregar condiciones de fecha al query si startDate y endDate están definidos
      if (startDateQuery && endDateQuery) {
        mongoQuery.lastMessageDate = {
          $gte: startDateQuery,
          $lte: endDateQuery,
        };
      }

      if (chatbotNumber) {
        mongoQuery.chatbotNumber = chatbotNumber;
      }
      if (query.step) {
        mongoQuery.step = query.step;
      }
      if (query.orderStatus) {
        mongoQuery.orderStatus = query.orderStatus;
      }

      // Construir la consulta y aplicar el ordenamiento
      const ctx = await this._ctxModel.find(mongoQuery).sort({
        orderStatus: 1, // Orden ascendente por orderStatus
        lastMessageDate: -1, // Orden descendente por lastMessageDate (más reciente primero)
      });

      return ctx;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async resetAllCtx(): Promise<void> {
    const defaultCtxValues = {
      help: 0,
      orderStatus: 0,
      deliveryName: '',
      deliveryNumber: '',
      address: '',
      currentOrder: null,
      currentOrderId: '',
      date: null,
      deliveryCost: 0,
      dni: '',
      deliveryConfirmationByDelivery: false,
      step: '',
      total: 0,
      paymentMethod: '',
      voucherUrl: '',
      statusBot: 1,
      isManual: false,
      deliveryMethod: null,
      paymentType: null,
      remindersCount: 0,
    };

    try {
      await this._ctxModel.updateMany({}, { $set: defaultCtxValues });
    } catch (error) {
      throw mongoExceptionHandler(error);
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

  /* If there is a request to delete everything, only delete the test chatbot numbers.  */
  async remove(clientPhone?: string): Promise<void> {
    try {
      /* test chatbot numbers */
      const numbersToDelete = ['51983714492', '15556163586'];
      const query: any = {};
      if (clientPhone) {
        query.clientPhone = clientPhone;
      } else {
        query.chatbotNumber = { $in: numbersToDelete };
      }
      await this._ctxModel.deleteMany(query);
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
