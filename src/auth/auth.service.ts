import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
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
import { EmailLoginDto } from './dto/email-login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterInstitutionalAdminDto } from './dto/register-institutional-admin.dto';
import { PasswordUtil } from 'src/common/utils/password.util';

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

    // 3. Si no existe, crearlo con el rol por defecto "USER"
    if (!user) {
      // Busca el rol por nombre
      const defaultRole = await this.roleRepository.findOne({
        where: { code: 'USER' },
      });
      if (!defaultRole) throw new Error('Default role USER not found');

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

    const token = this.jwtService.sign(payload);
    // 5. Retornar usuario y token
    return { 'user': user.toDto(), token };
  }

  async validateEmailLogin(loginDto: EmailLoginDto): Promise<{ user: UserDto; token: string }> {
    console.log('🔍 Buscando usuario con email:', loginDto.email);
    
    // 1. Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { 
        email: loginDto.email, 
        deleted: false 
      },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'],
    });

    console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
    if (user) {
      console.log('🔑 Usuario tiene password:', user.password ? 'SÍ' : 'NO');
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    if (!user.password) {
      throw new UnauthorizedException('Usuario no tiene contraseña configurada');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Verificar que el usuario esté activo
    if (!user.enabled) {
      throw new UnauthorizedException('Usuario no activo');
    }

    // 4. Actualizar último login
    user.login();
    await this.userRepository.save(user);

    // 5. Obtener la primera institución del usuario (o la principal)
    const primaryUserRole = user.userRoles?.[0];
    if (!primaryUserRole) {
      throw new UnauthorizedException('Usuario sin roles asignados');
    }

    // 6. Generar el JWT
    const payload: JwtDto = {
      sub: user.id,
      email: user.email,
      role: primaryUserRole.role.code,
      role_id: primaryUserRole.role_id,
      institution: primaryUserRole.institution_id,
    };

    const token = this.jwtService.sign(payload);

    // 7. Retornar usuario y token
    return { user: user.toDto(), token };
  }

  async register(registerDto: RegisterDto): Promise<{ user: UserDto; token: string }> {
    console.log('📝 Iniciando registro para email:', registerDto.email);

    // 1. Validar dominio institucional
    const email = registerDto.email;
    const emailDomain = email.split('@')[1];
    
    const institution = await this.institutionRepository.findOne({
      where: { domain: emailDomain, enabled: true, deleted: false }
    });

    if (!institution) {
      throw new BadRequestException(`El dominio ${emailDomain} no está autorizado para registro`);
    }

    console.log('🏢 Institución encontrada:', institution.description);

    // 2. Verificar que el usuario no exista (email)
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email, deleted: false }
    });

    if (existingUserByEmail) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    // 3. Verificar que no exista usuario con el mismo documento
    const existingUserByDocument = await this.userRepository.findOne({
      where: { 
        document_number: registerDto.document_number,
        deleted: false 
      }
    });

    if (existingUserByDocument) {
      throw new ConflictException('Ya existe un usuario con este número de documento');
    }

    console.log('✅ Validaciones pasadas, creando usuario...');

    // 4. Hash de la contraseña
    const hashedPassword = await PasswordUtil.hashPassword(registerDto.password);

    // 5. Buscar rol por defecto "USUARIO"
    const defaultRole = await this.roleRepository.findOne({
      where: { code: 'USER', enabled: true, deleted: false }
    });

    if (!defaultRole) {
      throw new BadRequestException('Rol USER no configurado en el sistema');
    }

    // 6. Crear usuario
    const newUser = this.userRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      document_number: registerDto.document_number,
      document_type: registerDto.document_type,
      phone: registerDto.phone,
      student_code: registerDto.student_code,
      password: hashedPassword,
      enabled: true,
      deleted: false,
      last_login: new Date(),
      createdBy: 'self-register',
      updatedBy: 'self-register'
    });

    // 7. Crear relación usuario-rol
    const userRole = this.userRoleRepository.create({
      role: defaultRole,
      institution: institution,
      enabled: true,
      deleted: false,
      createdBy: 'self-register',
      updatedBy: 'self-register'
    });

    newUser.userRoles = [userRole];

    // 8. Guardar usuario
    const savedUser = await this.userRepository.save(newUser);

    console.log('✅ Usuario registrado exitosamente:', savedUser.email);

    // 9. Generar JWT
    const payload: JwtDto = {
      sub: savedUser.id,
      email: savedUser.email,
      role: defaultRole.code,
      role_id: defaultRole.id,
      institution: institution.id,
    };

    const token = this.jwtService.sign(payload);

    // 10. Retornar usuario y token
    return { user: savedUser.toDto(), token };
  }

  async registerAdmin(registerAdminDto: RegisterAdminDto): Promise<{ user: UserDto; token: string }> {
    console.log('👑 Iniciando registro de ADMIN SUPREMO para email:', registerAdminDto.email);

    // 1. Validar clave secreta de administrador
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'WASIRIFA_ADMIN_2024';
    
    if (registerAdminDto.adminSecretKey !== ADMIN_SECRET_KEY) {
      console.log('❌ Clave secreta inválida para registro de admin');
      throw new UnauthorizedException('Clave secreta de administrador inválida');
    }

    console.log('🔑 Clave secreta validada correctamente');

    // 2. Validar dominio (debe ser @wasirifa.digital)
    const email = registerAdminDto.email;
    const emailDomain = email.split('@')[1];
    
    if (emailDomain !== 'wasirifa.digital') {
      throw new BadRequestException('Los administradores supremos deben usar email @wasirifa.digital');
    }

    // 3. Buscar institución WasiRifa
    const institution = await this.institutionRepository.findOne({
      where: { domain: 'wasirifa.digital', enabled: true, deleted: false }
    });

    if (!institution) {
      throw new BadRequestException('Institución WasiRifa Digital no encontrada en el sistema');
    }

    console.log('🏢 Institución WasiRifa encontrada:', institution.description);

    // 4. Verificar que el usuario no exista (email)
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email, deleted: false }
    });

    if (existingUserByEmail) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    // 5. Verificar que no exista usuario con el mismo documento
    const existingUserByDocument = await this.userRepository.findOne({
      where: { 
        document_number: registerAdminDto.document_number,
        deleted: false 
      }
    });

    if (existingUserByDocument) {
      throw new ConflictException('Ya existe un usuario con este número de documento');
    }

    console.log('✅ Validaciones pasadas, creando ADMIN SUPREMO...');

    // 6. Hash de la contraseña
    const hashedPassword = await PasswordUtil.hashPassword(registerAdminDto.password);

    // 7. Buscar rol ADMINSUPREMO
    const adminRole = await this.roleRepository.findOne({
      where: { code: 'ADMINSUPREMO', enabled: true, deleted: false }
    });

    if (!adminRole) {
      throw new BadRequestException('Rol ADMINSUPREMO no configurado en el sistema');
    }

    console.log('👑 Rol ADMINSUPREMO encontrado');

    // 8. Crear usuario administrador
    const newAdmin = this.userRepository.create({
      email: registerAdminDto.email,
      firstName: registerAdminDto.firstName,
      lastName: registerAdminDto.lastName,
      document_number: registerAdminDto.document_number,
      document_type: registerAdminDto.document_type,
      phone: registerAdminDto.phone,
      student_code: undefined, // Los admins no tienen código de estudiante
      password: hashedPassword,
      enabled: true,
      deleted: false,
      last_login: new Date(),
      createdBy: 'admin-register',
      updatedBy: 'admin-register'
    });

    // 9. Crear relación usuario-rol
    const userRole = this.userRoleRepository.create({
      role: adminRole,
      institution: institution,
      enabled: true,
      deleted: false,
      createdBy: 'admin-register',
      updatedBy: 'admin-register'
    });

    newAdmin.userRoles = [userRole];

    // 10. Guardar administrador
    const savedAdmin = await this.userRepository.save(newAdmin);

    console.log('✅ ADMIN SUPREMO registrado exitosamente:', savedAdmin.email);

    // 11. Generar JWT
    const payload: JwtDto = {
      sub: savedAdmin.id,
      email: savedAdmin.email,
      role: adminRole.code,
      role_id: adminRole.id,
      institution: institution.id,
    };

    const token = this.jwtService.sign(payload);

    // 12. Retornar administrador y token
    return { user: savedAdmin.toDto(), token };
  }

  async registerInstitutionalAdmin(registerDto: RegisterInstitutionalAdminDto): Promise<{ user: UserDto; token: string }> {
    console.log('🏫 Iniciando registro de ADMIN institucional para email:', registerDto.email);

    // 1. Verificar que la institución existe
    const institution = await this.institutionRepository.findOne({
      where: { id: registerDto.institutionId, deleted: false, enabled: true }
    });

    if (!institution) {
      throw new BadRequestException(`Institución con ID ${registerDto.institutionId} no encontrada o inactiva`);
    }

    console.log('🏢 Institución encontrada:', institution.description);

    // 2. Validar que el email corresponde al dominio de la institución
    const emailDomain = registerDto.email.split('@')[1];
    if (emailDomain !== institution.domain) {
      throw new BadRequestException(`El email debe corresponder al dominio de la institución: @${institution.domain}`);
    }

    // 3. Verificar que el usuario no exista (email)
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email, deleted: false }
    });

    if (existingUserByEmail) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    // 4. Verificar que no exista usuario con el mismo documento
    const existingUserByDocument = await this.userRepository.findOne({
      where: { 
        document_number: registerDto.document_number,
        deleted: false 
      }
    });

    if (existingUserByDocument) {
      throw new ConflictException('Ya existe un usuario con este número de documento');
    }

    console.log('✅ Validaciones pasadas, creando ADMIN institucional...');

    // 5. Hash de la contraseña
    const hashedPassword = await PasswordUtil.hashPassword(registerDto.password);

    // 6. Buscar rol ADMIN
    const adminRole = await this.roleRepository.findOne({
      where: { code: 'ADMIN', enabled: true, deleted: false }
    });

    if (!adminRole) {
      throw new BadRequestException('Rol ADMIN no configurado en el sistema');
    }

    console.log('🔑 Rol ADMIN encontrado');

    // 7. Crear usuario administrador
    const newAdmin = this.userRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      document_number: registerDto.document_number,
      document_type: registerDto.document_type,
      phone: registerDto.phone,
      student_code: undefined, // Los admins no tienen código de estudiante
      password: hashedPassword,
      enabled: true,
      deleted: false,
      last_login: new Date(),
      createdBy: 'admin-register',
      updatedBy: 'admin-register'
    });

    // 8. Crear relación usuario-rol
    const userRole = this.userRoleRepository.create({
      role: adminRole,
      institution: institution,
      enabled: true,
      deleted: false,
      createdBy: 'admin-register',
      updatedBy: 'admin-register'
    });

    newAdmin.userRoles = [userRole];

    // 9. Guardar administrador
    const savedAdmin = await this.userRepository.save(newAdmin);

    console.log('✅ ADMIN institucional registrado exitosamente:', savedAdmin.email);

    // 10. Generar JWT
    const payload: JwtDto = {
      sub: savedAdmin.id,
      email: savedAdmin.email,
      role: adminRole.code,
      role_id: adminRole.id,
      institution: institution.id,
    };

    const token = this.jwtService.sign(payload);

    // 11. Retornar administrador y token
    return { user: savedAdmin.toDto(), token };
  }
}
