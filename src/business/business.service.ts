import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { CreateBusinessDto, LoginBusinessDto, UpdateMetaAccess } from './dto';
import { AuthService } from 'src/auth/auth.service';
import { MongoDbService } from './db/mongodb.service';
import { IBusinessDao } from './db/businessDao';

@Injectable()
export class BusinessService {
  private readonly _db: IBusinessDao;

  constructor(
    private authService: AuthService,
    private readonly _mongoDbService: MongoDbService,
  ) {
    this._db = this._mongoDbService;
  }
  async createBusiness(createBusinessDto: CreateBusinessDto) {
    try {
      const hashedPassword = await this.authService.hashPassword(
        createBusinessDto.password,
      );
      const newBusiness = await this._db.create({
        ...createBusinessDto,
        password: hashedPassword,
      });
      delete newBusiness.password;
      const businessResponse = {
        id: newBusiness._id,
        businessName: newBusiness.businessName,
        email: newBusiness.email,
        businessId: newBusiness.businessId,
        adminPhone: newBusiness.adminPhone,
        chatbotNumber: newBusiness.chatbotNumber,
        businessHours: newBusiness.businessHours,
        isActive: newBusiness.isActive,
        address: newBusiness.address,
        // token: this.authService.getJwtToken({ id: newBusiness._id }), // Generar token si es necesario aquí
      };
      return businessResponse;
    } catch (error) {
      throw error;
    }
  }

  async loginBusiness(loginBusinessDto: LoginBusinessDto) {
    const { email, password } = loginBusinessDto;
    const business = await this._db.findOne(email);
    if (
      !business ||
      !(await this.authService.comparePasswords(password, business.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.authService.getJwtToken({ id: business.id });
    return { ...business.toObject(), password: undefined, token };
  }

  async updateMetadata(id: string, updateMetaAccess: UpdateMetaAccess) {
    const hashedPassword = await this.authService.hashPassword(
      updateMetaAccess.accessToken,
    );
    updateMetaAccess.accessToken = hashedPassword;
    const business = await this._db.updateMetaAccess(id, updateMetaAccess);
    return business;
  }

  async getMetaAccess(term: string) {
    const business = await this._db.findOne(term);
    return business;
  }

  async getBusiness(term: string) {
    const business = await this._db.findOne(term);
    return business;
  }
}
