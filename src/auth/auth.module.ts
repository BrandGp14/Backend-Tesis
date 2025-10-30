import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JWTAuthModule } from 'src/jwt-auth/jwt-auth.module';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';

@Module({
  imports: [PassportModule, JWTAuthModule, EntitiesModuleModule],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
