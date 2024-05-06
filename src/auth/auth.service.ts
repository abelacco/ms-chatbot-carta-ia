import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Business } from 'src/business/entity';

@Injectable()
export class AuthService {
  constructor(
    // @InjectModel(Business.name) private businessModel: Model<Business>,
    private jwtService: JwtService,
  ) {}

  // Método para hashear contraseñas
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10); // El número 10 es el número de rondas para generar el salt
  }

  // Método para verificar contraseñas
  async comparePasswords(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, storedPasswordHash);
  }

  // async loginBusiness(email: string, password: string) {
  //   const business = await this.businessModel
  //     .findOne({ email })
  //     .select('+password');

  //   if (!business || !(await bcrypt.compare(password, business.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   const token = this.getJwtToken({ id: business.id });
  //   return { ...business.toObject(), password: undefined, token };
  // }

  getJwtToken(payload: { id: string }) {
    return this.jwtService.sign(payload);
  }

  handleDBErrors(error: any): never {
    if (error.code === '11000') {
      // Código de error para duplicados en MongoDB
      throw new BadRequestException('Business with this email already exists');
    }
    console.error(error);
    throw new InternalServerErrorException('Check server logs');
  }
}
