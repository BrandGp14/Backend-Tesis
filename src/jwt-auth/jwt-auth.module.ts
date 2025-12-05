import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { JwtAuthStrategy } from './jwt-auth.strategy';
import { JwtAuthService } from './jwt-auth.service';
import { JwtWsAuthGuard } from './jwt-ws-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => jwtConfig(configService),
    }),
  ],
  providers: [JwtAuthStrategy, JwtAuthService, JwtWsAuthGuard],
  exports: [JwtModule]
})
export class JWTAuthModule { }
