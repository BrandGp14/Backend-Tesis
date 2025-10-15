import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
  logging: false,
  extra: {
    max: 20,
    connectionTimeoutMillis: 2000,
  },
});