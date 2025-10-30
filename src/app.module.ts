import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { RafflesModule } from './raffles/raffles.module';
import { InstitutesModule } from './institutes/institutes.module';
import { UploadFileModule } from './upload-file/upload-file.module';
import { JWTAuthModule } from './jwt-auth/jwt-auth.module';
import { JwtService } from '@nestjs/jwt';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { EntitiesModuleModule } from './entities-module/entities-module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    RafflesModule,
    InstitutesModule,
    UploadFileModule,
    JWTAuthModule,
    DashboardModule,
    PaymentModule,
    EntitiesModuleModule,
  ],
  exports: [TypeOrmModule],
  providers: [JwtService, DashboardService],
  controllers: [DashboardController],
})
export class AppModule { }
