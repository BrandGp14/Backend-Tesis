import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { RafflesModule } from './raffles/raffles.module';
import { InstitutesModule } from './institutes/institutes.module';
import { UploadFileModule } from './upload-file/upload-file.module';

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
  ],
})
export class AppModule {}
