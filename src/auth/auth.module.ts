import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_key',
      signOptions: { expiresIn: '60m' }, // Puedes ajustar el tiempo según tus necesidades
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
