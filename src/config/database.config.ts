import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  ssl: { rejectUnauthorized: false },
  logging: ['query', 'error'],
  extra: {
    max: 20,
    connectionTimeoutMillis: 10000, // Aumentado de 2 a 10 segundos
  },
});
