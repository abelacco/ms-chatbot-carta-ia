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

  async getToken() {
    const url = `${process.env.CARTA_DIRECTA_URL}/vendor/auth/gettoken`;
    const data = {
      email: process.env.CARTA_DIRECTA_EMAIL,
      password: process.env.CARTA_DIRECTA_PASSWORD,
    };

    try {
      const response = await axios.post(url, data);
      return response.data.token;
    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.data);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  async getOrdersList() {
    const token = await this.getToken();
    const url = `${process.env.URI_CARTA_DIRECTA}/vendor/orders?api_token=${token}`;
    try {
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getOrderById(orderId: number) {
    const ordersList = await this.getOrdersList();
    const order = ordersList.find((order) => order.id === orderId);
    return order;
  }

  async getOrderStatus(orderId: number) {
    const order = await this.getOrderById(orderId);
    if (!order || order.length === 0) {
      return 'No hay orden';
    } else {
      const orderStatus = order.last_status[0].name;
      return orderStatus;
    }
  }

  async getMenuFromApi() {
    try {
      const response = await axios.get(
        `${process.env.URI_CARTA_DIRECTA}/client/vendor/38/items`,
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return null;
    }
  }

  async parseMenuFromApiResponse() {
    const menu = {
      comidas: '',
      extras: '',
      bebidas: '',
    };
    let stepMenu = 'comidas';

    const memuFromApi = await this.getMenuFromApi();
    memuFromApi.forEach((element, index) => {
      if (index === 6) {
        stepMenu = 'bebidas';
      }

      menu[stepMenu] =
        menu[stepMenu] +
        JSON.stringify(
          element.map((item: any) => ({
            name: item.name,
            description: item.description,
            price: item.price,
          })),
        );

      if (index === 0) {
        menu.extras = JSON.stringify(
          element[0].extras.map((item) => ({
            name: item.name,
            price: item.price,
          })),
        );
      }
    });

    return menu;
  }
}
