import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import type { GoogleProfile } from 'src/users/dto/user-google.dto';
import { Institution } from 'src/institutes/entities/institute.entity';
import { UserRole } from 'src/users/entities/user-role.entity';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { use } from 'passport';
import { UserDto } from 'src/users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    private readonly jwtService: JwtService,
  ) { }

  async validateOAuthLogin(profile: GoogleProfile): Promise<{ user: UserDto; token: string }> {
    const email = profile.email;

    const institutions = await this.institutionRepository.find();

    // 1. Validación de dominio
    const institution = institutions.find((inst) => email.endsWith(inst.domain));
    if (!institution) {
      throw new UnauthorizedException('Correo no permitido');
    }

    // 2. Buscar el usuario por email
    let user = await this.userRepository.findOne({
      where: { email, deleted: false },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'],
    });

    // 3. Si no existe, crearlo con el rol por defecto "STUDENT"
    if (!user) {
      // Busca el rol por nombre
      const defaultRole = await this.roleRepository.findOne({
        where: { code: 'STUDENT' },
      });
      if (!defaultRole) throw new Error('Default role STUDENT not found');

      user = this.userRepository.create({
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profile_photo_url: profile.picture,
        google_id: profile.id,
        createdBy: '',
        updatedBy: '',
      });

      user.userRoles = [
        this.userRoleRepository.create({
          role: defaultRole,
          institution: institution,
          createdBy: '',
          updatedBy: '',
        })
      ]

      user = await this.userRepository.save(user);
    } else if (!user.enabled) throw new UnauthorizedException('Usuario no activo');

    user.login();
    this.userRepository.save(user);

    const userRole = user.userRoles?.find((userRole) => userRole.institution.id === institution.id);

    // 4. Generar el JWT
    const payload: JwtDto = {
      sub: user.id,
      email: user.email,
      role: userRole?.role.code ?? '',
      role_id: userRole?.role_id ?? '',
      institution: institution.id,
    };

    console.log(user)

    const token = this.jwtService.sign(payload);
    // 5. Retornar usuario y token
    return { 'user': user.toDto(), token };
  }
}
