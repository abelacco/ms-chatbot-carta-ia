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
import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    // @InjectModel(Business.name) private businessModel: Model<Business>,
    private jwtService: JwtService,
  ) {}

  // Método para encriptar contraseñas
  async hashPassword(password: string): Promise<string> {
    const encryptedPass = this.encrypt(password);
    return encryptedPass;
  }

  // Método para verificar contraseñas
  async comparePasswords(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    const comparedResult = password === this.decrypt(storedPasswordHash);
    return comparedResult;
  }

  encrypt(text: string) {
    const key = Buffer.from(process.env.ENCRYPT_PASSWORD, 'utf8').slice(0, 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText) {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = Buffer.from(process.env.ENCRYPT_PASSWORD, 'utf8').slice(0, 32);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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
