import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { UserRole } from './entities/user-role.entity';
import { Institution } from 'src/institutes/entities/institute.entity';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { AdminUserDto, AdminRoleDto } from './dto/admin-response.dto';
import { AdministratorsDashboardDto, AdministratorItemDto, InstitutionItemDto, PaginationMetaDto } from './dto/administrators-dashboard.dto';
import { AdministratorsQueryDto } from './dto/administrators-query.dto';
import { PromoteUserToAdminDto } from './dto/create-administrator.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterOrganizadorDto, RegisterOrganizadorResponseDto } from './dto/register-organizador.dto';
import { PasswordUtil } from '../common/utils/password.util';
import { Role } from '../roles/entities/role.entity';
import { InstitutionDepartment } from '../institutes/entities/institution-department.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Institution)
    private institutionsRepository: Repository<Institution>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(InstitutionDepartment)
    private departmentsRepository: Repository<InstitutionDepartment>,
  ) { }

  async search(page: number, size: number, enabled?: boolean) {
    const skip = (page - 1) * size;

    const [users, totalElements] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: skip,
      take: size,
      where: [enabled !== undefined ? { enabled: enabled } : {}, { deleted: false }],
    });

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<UserDto>(users.map(u => u.toDto()), page, size, totalPage, totalElements, last);
  }

  async find(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id, deleted: false },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user', 'assigned']
    });
    if (!user) return undefined;
    return user.toDto();
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email, deleted: false },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user', 'assigned']
    });
    if (!user) return undefined;
    return user.toDto();
  }

  async create(dto: UserDto, jwtDto: JwtDto) {

    const assigned = await this.usersRepository.find({ where: { id: In(dto.assigned.map(a => a.id)) } });

    let user = User.fromDto(dto, assigned, jwtDto.sub);
    user = await this.usersRepository.save(user);
    return user.toDto();
  }

  async update(id: string, dto: UpdateUserDto, jwtDto: JwtDto) {
    let user = await this.usersRepository.findOne({
      where: { id, deleted: false },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user', 'assigned']
    });

    if (!user) throw new NotFoundException('User not found');

    user.update(dto, jwtDto.sub);

    user = await this.usersRepository.save(user);

    user = await this.usersRepository.findOne({ where: { id: user.id }, relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'] });

    return user?.toDto();
  }

  async getAdminUsers(): Promise<AdminUserDto[]> {
    // Buscar usuarios con roles ADMIN o SUPER_ADMIN
    const adminUsers = await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('userRole.institution', 'institution')
      .where('user.deleted = false')
      .andWhere('user.enabled = true')
      .andWhere('userRole.deleted = false')
      .andWhere('userRole.enabled = true')
      .andWhere('role.code IN (:...roles)', { roles: ['ADMIN', 'SUPER_ADMIN'] })
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    // Mapear a DTO de respuesta
    const adminDtos: AdminUserDto[] = adminUsers.map(user => {
      // Obtener la institución principal (primera activa)
      const primaryUserRole = user.userRoles?.find(ur =>
        ur.enabled && !ur.deleted && ['ADMIN', 'SUPER_ADMIN'].includes(ur.role.code)
      );

      // Mapear todos los roles administrativos del usuario
      const roles: AdminRoleDto[] = user.userRoles
        ?.filter(ur => ur.enabled && !ur.deleted && ['ADMIN', 'SUPER_ADMIN'].includes(ur.role.code))
        .map(ur => ({
          roleDescription: ur.role.code,
          institutionDescription: ur.institution.description
        })) || [];

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        institutionId: primaryUserRole?.institution.id || '',
        institutionName: primaryUserRole?.institution.description || '',
        roles,
        createdAt: user.createdAt.toISOString()
      };
    });

    return adminDtos;
  }

  async getAdministratorsDashboard(query: AdministratorsQueryDto): Promise<AdministratorsDashboardDto> {
    const {
      adminPage = 1,
      adminLimit = 10,
      institutionPage = 1,
      institutionLimit = 10
    } = query;

    // Calcular skip para administradores
    const adminSkip = (adminPage - 1) * adminLimit;

    // Obtener administradores con paginación
    const adminQueryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('userRole.institution', 'institution')
      .where('user.deleted = false')
      .andWhere('userRole.deleted = false')
      .andWhere('userRole.enabled = true')
      .andWhere('role.code IN (:...roles)', { roles: ['ADMIN', 'SUPER_ADMIN'] })
      .orderBy('user.createdAt', 'DESC');

    // Contar total de administradores
    const totalAdmins = await adminQueryBuilder.getCount();

    // Obtener administradores con paginación
    const adminUsers = await adminQueryBuilder
      .skip(adminSkip)
      .take(adminLimit)
      .getMany();

    // Mapear administradores
    const administrators: AdministratorItemDto[] = adminUsers.map(user => {
      const primaryUserRole = user.userRoles?.find(ur =>
        ur.enabled && !ur.deleted && ['ADMIN', 'SUPER_ADMIN'].includes(ur.role.code)
      );

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: primaryUserRole?.role.code || 'ADMIN',
        institutionId: primaryUserRole?.institution.id || '',
        registrationDate: user.createdAt.toISOString(),
        isActive: user.enabled
      };
    });

    // Calcular skip para instituciones
    const institutionSkip = (institutionPage - 1) * institutionLimit;

    // Contar total de instituciones
    const totalInstitutions = await this.institutionsRepository.count({
      where: { deleted: false }
    });

    // Obtener instituciones con paginación
    const institutions = await this.institutionsRepository.find({
      where: { deleted: false },
      order: { createdAt: 'DESC' },
      skip: institutionSkip,
      take: institutionLimit
    });

    // Mapear instituciones
    const institutionsData: InstitutionItemDto[] = institutions.map(institution => ({
      id: institution.id,
      name: institution.description,
      domain: institution.domain,
      logoUrl: institution.picture || null,
      contactEmail: institution.email || '',
      contactPhone: institution.phone || '',
      address: institution.address || '',
      isActive: institution.enabled,
      createdAt: institution.createdAt.toISOString()
    }));

    // Calcular metadatos de paginación
    const administratorsPagination: PaginationMetaDto = {
      total: totalAdmins,
      page: adminPage,
      limit: adminLimit,
      totalPages: Math.ceil(totalAdmins / adminLimit)
    };

    const institutionsPagination: PaginationMetaDto = {
      total: totalInstitutions,
      page: institutionPage,
      limit: institutionLimit,
      totalPages: Math.ceil(totalInstitutions / institutionLimit)
    };

    return {
      administrators,
      administratorsPagination,
      institutions: institutionsData,
      institutionsPagination
    };
  }

  async promoteUserToAdmin(promoteDto: PromoteUserToAdminDto) {
    // Verificar que la institución existe
    const institution = await this.institutionsRepository.findOne({
      where: { id: promoteDto.institutionId, deleted: false, enabled: true }
    });

    if (!institution) {
      throw new NotFoundException(`Institución con ID ${promoteDto.institutionId} no encontrada o inactiva`);
    }

    // Buscar el usuario por email
    const user = await this.usersRepository.findOne({
      where: { email: promoteDto.email, deleted: false },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${promoteDto.email} no encontrado`);
    }

    // Validar que el email corresponde al dominio de la institución
    const emailDomain = promoteDto.email.split('@')[1];
    if (emailDomain !== institution.domain) {
      throw new BadRequestException(`El usuario debe pertenecer al dominio de la institución: @${institution.domain}`);
    }

    // Buscar rol actual del usuario en esta institución
    const currentUserRole = user.userRoles.find(ur =>
      ur.institution.id === promoteDto.institutionId &&
      !ur.deleted &&
      ur.enabled
    );

    // Verificar si ya es ADMIN en esta institución
    if (currentUserRole && currentUserRole.role.code === 'ADMIN') {
      throw new ConflictException(`El usuario ya tiene rol de ADMIN en esta institución`);
    }

    // Buscar el rol ADMIN
    const adminRole = await this.rolesRepository.findOne({
      where: { code: 'ADMIN', enabled: true, deleted: false }
    });

    if (!adminRole) {
      throw new NotFoundException('Rol ADMIN no encontrado en el sistema');
    }

    if (currentUserRole) {
      // Actualizar rol existente (cambiar de ESTUDIANTE a ADMIN)
      currentUserRole.role = adminRole;
      currentUserRole.updatedBy = 'SUPER_ADMIN';
      await this.userRolesRepository.save(currentUserRole);
    } else {
      // Crear nueva relación usuario-rol si no tenía rol en esta institución
      const newUserRole = this.userRolesRepository.create({
        user: user,
        role: adminRole,
        institution: institution,
        enabled: true,
        deleted: false,
        createdBy: 'SUPER_ADMIN',
        updatedBy: 'SUPER_ADMIN'
      });
      await this.userRolesRepository.save(newUserRole);
    }

    // Retornar respuesta
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: 'ADMIN',
      institutionId: promoteDto.institutionId,
      registrationDate: user.createdAt.toISOString(),
      isActive: user.enabled
    };
  }

  async changeUserRole(changeDto: ChangeUserRoleDto, adminUser: JwtDto) {
    // Verificar que la institución existe
    const institution = await this.institutionsRepository.findOne({
      where: { id: changeDto.institutionId, deleted: false, enabled: true }
    });

    if (!institution) {
      throw new NotFoundException(`Institución con ID ${changeDto.institutionId} no encontrada o inactiva`);
    }

    // Buscar el usuario por email
    const user = await this.usersRepository.findOne({
      where: { email: changeDto.email, deleted: false },
      relations: ['userRoles', 'userRoles.role', 'userRoles.institution']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${changeDto.email} no encontrado`);
    }

    // Validar que el email corresponde al dominio de la institución
    const emailDomain = changeDto.email.split('@')[1];
    if (emailDomain !== institution.domain) {
      throw new BadRequestException(`El usuario debe pertenecer al dominio de la institución: @${institution.domain}`);
    }

    // Buscar rol actual del usuario en esta institución
    const currentUserRole = user.userRoles.find(ur =>
      ur.institution.id === changeDto.institutionId &&
      !ur.deleted &&
      ur.enabled
    );

    if (!currentUserRole) {
      throw new NotFoundException(`El usuario no tiene rol asignado en esta institución`);
    }

    // Verificar si ya tiene el rol solicitado
    if (currentUserRole.role.code === changeDto.newRole) {
      throw new ConflictException(`El usuario ya tiene el rol ${changeDto.newRole} en esta institución`);
    }

    // Buscar el nuevo rol
    const newRole = await this.rolesRepository.findOne({
      where: { code: changeDto.newRole, enabled: true, deleted: false }
    });

    if (!newRole) {
      throw new NotFoundException(`Rol ${changeDto.newRole} no encontrado en el sistema`);
    }

    // Guardar rol anterior para auditoría
    const previousRole = currentUserRole.role.code;

    // Actualizar el rol
    currentUserRole.role = newRole;
    currentUserRole.updatedBy = adminUser.email; // Registrar quién hizo el cambio
    await this.userRolesRepository.save(currentUserRole);

    // Retornar respuesta con auditoría
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      previousRole: previousRole,
      newRole: changeDto.newRole,
      institutionId: changeDto.institutionId,
      changedBy: adminUser.email,
      changedAt: new Date().toISOString()
    };
  }

  async registerAdmin(registerDto: RegisterAdminDto) {
    // Verificar que la institución existe
    const institution = await this.institutionsRepository.findOne({
      where: { id: registerDto.institutionId, deleted: false, enabled: true }
    });

    if (!institution) {
      throw new NotFoundException(`Institución con ID ${registerDto.institutionId} no encontrada o inactiva`);
    }

    // Validar que el email corresponde al dominio de la institución
    const emailDomain = registerDto.email.split('@')[1];
    if (emailDomain !== institution.domain) {
      throw new BadRequestException(`El email debe corresponder al dominio de la institución: @${institution.domain}`);
    }

    // Verificar que no existe un usuario con ese email
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email, deleted: false }
    });

    if (existingUserByEmail) {
      throw new ConflictException(`Ya existe un usuario con el email: ${registerDto.email}`);
    }

    // Verificar que no existe usuario con el mismo documento
    const existingUserByDocument = await this.usersRepository.findOne({
      where: {
        document_number: registerDto.document_number,
        deleted: false
      }
    });

    if (existingUserByDocument) {
      throw new ConflictException(`Ya existe un usuario con el número de documento: ${registerDto.document_number}`);
    }

    // Buscar el rol ADMIN
    const adminRole = await this.rolesRepository.findOne({
      where: { code: 'ADMIN', enabled: true, deleted: false }
    });

    if (!adminRole) {
      throw new NotFoundException('Rol ADMIN no encontrado en el sistema');
    }

    // Hash de la contraseña
    const hashedPassword = await PasswordUtil.hashPassword(registerDto.password);

    // Crear el usuario
    const newUser = this.usersRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      document_number: registerDto.document_number,
      document_type: registerDto.document_type,
      phone: registerDto.phone,
      password: hashedPassword,
      enabled: true,
      deleted: false,
      last_login: new Date(),
      createdBy: 'SUPER_ADMIN',
      updatedBy: 'SUPER_ADMIN'
    });

    // Guardar el usuario
    const savedUser = await this.usersRepository.save(newUser);

    // Crear la relación usuario-rol
    const userRole = this.userRolesRepository.create({
      user: savedUser,
      role: adminRole,
      institution: institution,
      enabled: true,
      deleted: false,
      createdBy: 'SUPER_ADMIN',
      updatedBy: 'SUPER_ADMIN'
    });

    await this.userRolesRepository.save(userRole);

    // Retornar respuesta
    return {
      id: savedUser.id,
      name: `${registerDto.firstName} ${registerDto.lastName}`,
      email: savedUser.email,
      role: 'ADMIN',
      institutionId: registerDto.institutionId,
      registrationDate: savedUser.createdAt.toISOString(),
      isActive: true
    };
  }

  async registerOrganizador(registerDto: RegisterOrganizadorDto): Promise<RegisterOrganizadorResponseDto> {
    // Verificar que el departamento existe
    const department = await this.departmentsRepository.findOne({
      where: { id: registerDto.departmentId, deleted: false, enabled: true },
      relations: ['institution']
    });

    if (!department) {
      throw new NotFoundException(`Departamento con ID ${registerDto.departmentId} no encontrado o inactivo`);
    }

    // Verificar que el departamento pertenece a TECSUP
    if (department.institution.domain !== 'tecsup.edu.pe') {
      throw new BadRequestException('El departamento debe pertenecer a la institución TECSUP');
    }

    // Validar que el email corresponde al dominio de TECSUP
    const emailDomain = registerDto.email.split('@')[1];
    if (emailDomain !== 'tecsup.edu.pe') {
      throw new BadRequestException('El email debe corresponder al dominio de TECSUP: @tecsup.edu.pe');
    }

    // Verificar que no existe un usuario con ese email
    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email, deleted: false }
    });

    if (existingUserByEmail) {
      throw new ConflictException(`Ya existe un usuario con el email: ${registerDto.email}`);
    }

    // Verificar que no existe usuario con el mismo documento
    const existingUserByDocument = await this.usersRepository.findOne({
      where: {
        document_number: registerDto.document_number,
        deleted: false
      }
    });

    if (existingUserByDocument) {
      throw new ConflictException(`Ya existe un usuario con el número de documento: ${registerDto.document_number}`);
    }

    // Buscar el rol ORGANIZER
    const organizadorRole = await this.rolesRepository.findOne({
      where: { code: 'ORGANIZER', enabled: true, deleted: false }
    });

    if (!organizadorRole) {
      throw new NotFoundException('Rol ORGANIZER no encontrado en el sistema');
    }

    // Hash de la contraseña
    const hashedPassword = await PasswordUtil.hashPassword(registerDto.password);

    // Crear el usuario
    const newUser = this.usersRepository.create({
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
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    });

    // Guardar el usuario
    const savedUser = await this.usersRepository.save(newUser);

    // Crear la relación usuario-rol-departamento
    const userRole = this.userRolesRepository.create({
      user: savedUser,
      role: organizadorRole,
      institution: department.institution,
      department: department,
      department_id: department.id,
      enabled: true,
      deleted: false,
      createdBy: 'ADMIN',
      updatedBy: 'ADMIN'
    });

    await this.userRolesRepository.save(userRole);

    // Retornar respuesta
    return {
      id: savedUser.id,
      name: `${registerDto.firstName} ${registerDto.lastName}`,
      email: savedUser.email,
      role: 'ORGANIZER',
      institutionId: department.institution.id,
      departmentId: department.id,
      departmentName: department.description,
      registrationDate: savedUser.createdAt.toISOString(),
      isActive: true
    };
  }
}
