import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { JwtAuthStrategy } from './jwt-auth.strategy';
import { JwtAuthService } from './jwt-auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => jwtConfig(configService),
    }),
  ],
  exports: [JwtModule],
  providers: [JwtAuthStrategy, JwtAuthService],
})
export class JWTAuthModule { }
