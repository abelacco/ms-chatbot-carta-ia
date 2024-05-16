import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { IBusinessDao } from './businessDao';
// import { PaginationMessageDto } from '../dto/pagination.dto';
import { mongoExceptionHandler } from 'src/common/exceptions';
import { Business } from '../entity';
import { CreateBusinessDto, UpdateBusinessDto, UpdateMetaAccess } from '../dto';
import { isEmail } from 'class-validator';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class MongoDbService implements IBusinessDao {
  constructor(
    @InjectModel(Business.name)
    private readonly _businessModel: Model<Business>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    try {
      const createBusiness = new this._businessModel(createBusinessDto);
      await createBusiness.save();
      return createBusiness;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findOneByBusinesId(businessId: string): Promise<Business> {
    const business = await this._businessModel.findOne({
      businessId: businessId,
    });
    return business;
  }

  async findOrCreateBusiness(
    createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    const { businessId } = createBusinessDto;
    try {
      const business = await this._businessModel.findOne({
        businessId: businessId,
      });

      if (!business) {
        try {
          const newBusiness = new this._businessModel(createBusinessDto);
          await newBusiness.save();
          return newBusiness;
        } catch (error) {
          if (error.keyPattern.chatbotNumber === 1) {
            createBusinessDto.chatbotNumber = createBusinessDto.businessId;
            const newBusiness = new this._businessModel(createBusinessDto);
            await newBusiness.save();
            console.log(newBusiness);
            return newBusiness;
          } else {
            throw new InternalServerErrorException('Error creating business');
          }
        }
      }
      return business;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async findOne(term: string): Promise<Business> {
    let business: Business;
    try {
      if (isEmail(term)) {
        business = await this._businessModel.findOne({ email: term });
      } else if (isValidObjectId(term)) {
        business = await this._businessModel.findById(term);
      } else {
        business = await this._businessModel.findOne({
          chatbotNumber: term,
        });
      }
      return business;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async updateBusiness(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    try {
      const updatedBusiness = await this._businessModel.findByIdAndUpdate(
        id,
        updateBusinessDto,
        { new: true },
      );
      return updatedBusiness;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async updateMetaAccess(
    id: string,
    updateMetaAccess: UpdateMetaAccess,
  ): Promise<Business> {
    try {
      const updatedBusiness = await this._businessModel.findByIdAndUpdate(
        id,
        updateMetaAccess,
        { new: true },
      );
      return updatedBusiness;
    } catch (error) {
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }
}
