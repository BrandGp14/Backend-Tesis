import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtDto } from './dto/jwt.dto';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const jwtSecret = configService.get<string>('NEXT_AUTH_JWT_SECRET');
        if (!jwtSecret) throw new Error('JWT secret is not defined in environment variables');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    validate(payload: JwtDto) {
        return new JwtDto(payload.sub, payload.email, payload.role, payload.role_id);
    }
}
