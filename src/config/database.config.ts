import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
  synchronize: false, // Cambiar a false en producción para evitar problemas
  ssl: { rejectUnauthorized: false },
  logging: false, // Desactivar logging para evitar spam de consultas
  extra: {
    max: 10, // Reducir pool de conexiones
    connectionTimeoutMillis: 30000, // 30 segundos
    idleTimeoutMillis: 30000, // Timeout para conexiones inactivas
    query_timeout: 30000, // Timeout para consultas
  },
  retryAttempts: 3,
  retryDelay: 3000,
});
