import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import {
  CreateBusinessDto,
  LoginBusinessDto,
  UpdateMetaAccess,
  UpdatePaymentMethodDto,
} from './dto';
import { AuthService } from 'src/auth/auth.service';
import { MongoDbService } from './db/mongodb.service';
import { IBusinessDao } from './db/businessDao';
import { PAYMENT_METHODS } from 'src/common/constants';

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
    const hashedPassword = updateMetaAccess.accessToken;
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

  async changePaymentMethod(body: UpdatePaymentMethodDto) {
    if (!PAYMENT_METHODS.includes(body.paymentDetails.paymentMethodName)) {
      throw new BadRequestException(
        `${body.paymentDetails.paymentMethodName} is not aviable payment method`,
      );
    }

    try {
      const business = await this.getBusiness(body.chatbotNumber);
      let arrayChange = false;
      const newMethodArray = business.paymentMethods.map((method) => {
        if (
          method.paymentMethodName === body.paymentDetails.paymentMethodName
        ) {
          arrayChange = true;
          return body.paymentDetails;
        } else {
          return method;
        }
      });
      if (!arrayChange) {
        newMethodArray.push(body.paymentDetails);
      }
      business.paymentMethods = newMethodArray;

      const actualizedBusiness = await this._db.updateBusiness(
        business.id,
        business,
      );

      return actualizedBusiness;
    } catch (error) {
      throw error;
    }
  }

  async migrateRestaurants() {
    const restaurants = await this.cartaDirectaDbService.findAllCompanies();
    const mapedRestaurants = restaurants.map(async (restaurant) => {
      const openingHours =
        await this.cartaDirectaDbService.findCompanyOpeningHours(restaurant.id);
      const coverage = await this.cartaDirectaDbService.findCompanyCoverage(
        restaurant.id,
      );
      const parseCoverage = parseDeliveryArea(coverage);
      const user = await this.cartaDirectaDbService.findUser(
        restaurant.user_id,
      );
      const parsedHoures = parseHours(openingHours);
      const business = new BusinessModel({
        businessName: restaurant.subdomain || '',
        email: user.email || '',
        password: user.password || '',
        businessId: restaurant.id || '',
        chatbotNumber: '',
        adminPhone: restaurant.phone?.replace(/[^\d]/g, '') || '',
        businessHours: parsedHoures,
        isActive: true,
        address: restaurant.address || '',
        slogan: '',
        coverage: parseCoverage,
      });
      return business;
    });
    const resolvedRestaurants = await Promise.all(mapedRestaurants);
    const createdRestaurants = resolvedRestaurants.map(async (element) => {
      const migrateRestaurant = await this._db.findOrCreateBusiness(element);
      return migrateRestaurant;
    });
    return;
  }

  async migrateOneRestaurant(id: number) {
    const restaurant = await this.cartaDirectaDbService.findOneCompany(id);
    const openingHours =
      await this.cartaDirectaDbService.findCompanyOpeningHours(restaurant.id);
    const coverage = await this.cartaDirectaDbService.findCompanyCoverage(
      restaurant.id,
    );
    const parseCoverage = parseDeliveryArea(coverage);
    const user = await this.cartaDirectaDbService.findUser(restaurant.user_id);
    const parsedHoures = parseHours(openingHours);
    const business = new BusinessModel({
      businessName: restaurant.subdomain || '',
      email: user.email || '',
      password: user.password || '',
      businessId: restaurant.id || '',
      chatbotNumber: restaurant.phone?.replace(/[^\d]/g, '') || '',
      adminPhone: restaurant.phone?.replace(/[^\d]/g, '') || '',
      businessHours: parsedHoures,
      isActive: true,
      address: restaurant.address || '',
      slogan: '',
      coverage: parseCoverage,
    });

    const migrateRestaurant = await this._db.findOrCreateBusiness(business);
    return migrateRestaurant;
  }

  async updateCoverage(bussinesId: string) {
    const business = await this._db.findOneByBusinesId(bussinesId);
    if (!business) {
      throw new NotFoundException(
        `Bussines with business id: ${bussinesId} not found`,
      );
    }
    const coverage = await this.cartaDirectaDbService.findCompanyCoverage(
      parseInt(bussinesId),
    );
    const parseCoverage = parseDeliveryArea(coverage);
    business.coverage = parseCoverage;
    const updatedBussines = await this._db.updateBusiness(
      business.id,
      business,
    );
    console.log(updatedBussines);
    return updatedBussines;
  }

  async updateOpeningHours(bussinesId: string) {
    const business = await this._db.findOneByBusinesId(bussinesId);
    if (!business) {
      throw new NotFoundException(
        `Bussines with business id: ${bussinesId} not found`,
      );
    }
    const openingHours =
      await this.cartaDirectaDbService.findCompanyOpeningHours(
        parseInt(bussinesId),
      );
    const parseOpeningHours = parseHours(openingHours);
    business.businessHours = parseOpeningHours;
    const updatedBussines = await this._db.updateBusiness(
      business.id,
      business,
    );
    return updatedBussines;
  }
}
