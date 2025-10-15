import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: any): Promise<{ user: User; token: string }> {
    const email = profile.email;

    // 1. Validación de dominio
    if (!email.endsWith('@tecsup.edu.pe')) {
      throw new UnauthorizedException('Correo no permitido');
    }

    // 2. Buscar el usuario por email
    let user = await this.userRepository.findOne({ where: { email }, relations: ['role'] });

    // 3. Si no existe, crearlo con el rol por defecto "STUDENT"
    if (!user) {
      // Busca el rol por nombre
      const defaultRole = await this.roleRepository.findOne({ where: { name: 'STUDENT' } });
      if (!defaultRole) throw new Error('Default role STUDENT not found');

      user = this.userRepository.create({
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        picture: profile.picture,
        role: defaultRole,
        role_id: defaultRole.id,
      });
      user = await this.userRepository.save(user);
    }

    // 4. Generar el JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
      role_id: user.role?.id,
    };
    const token = this.jwtService.sign(payload);

    // 5. Retornar usuario y token
    return { user, token };
  }
}