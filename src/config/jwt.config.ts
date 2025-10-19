import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => {
  return {
    secret: configService.get<string>('NEXT_AUTH_JWT_SECRET'),
    signOptions: { expiresIn: '30d' },
  };
};
