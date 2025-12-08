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
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { EntitiesModuleModule } from './entities-module/entities-module.module';
import { ReportModule } from './report/report.module';
import { UsersModule } from './users/users.module';
import { NotificationModule } from './notification/notification.module';
import { ProfessorsModule } from './professors/professors.module';
import { ProfessorReportsModule } from './professor-reports/professor-reports.module';
import { ScheduleModule } from '@nestjs/schedule';

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
    ScheduleModule.forRoot(),
    AuthModule,
    RafflesModule,
    InstitutesModule,
    UploadFileModule,
    JWTAuthModule,
    DashboardModule,
    PaymentModule,
    EntitiesModuleModule,
    ReportModule,
    UsersModule,
    NotificationModule,
    ProfessorsModule,
    ProfessorReportsModule
  ],
  exports: [TypeOrmModule],
  providers: [JwtService],
  controllers: [],
})
export class AppModule { }
