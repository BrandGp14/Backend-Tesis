import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professor } from './entities/professor.entity';
import { User } from '../users/entities/user.entity';
import { InstitutionDepartment } from '../institutes/entities/institution-department.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateProfessorDto, AssignOrganizerDto, UpdateProfessorDto, CreateProfessorUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfessorsService {
  constructor(
    @InjectRepository(Professor)
    private professorRepository: Repository<Professor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InstitutionDepartment)
    private departmentRepository: Repository<InstitutionDepartment>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // Crear nuevo profesor
  async createProfessor(createProfessorDto: CreateProfessorDto, currentUserId: string): Promise<Professor> {
    const { userId, departmentId, specialization, employeeId, academicTitle } = createProfessorDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el departamento existe
    const department = await this.departmentRepository.findOne({ where: { id: departmentId } });
    if (!department) {
      throw new NotFoundException('Departamento no encontrado');
    }

    // Verificar que no existe ya un profesor para este usuario en este departamento
    const existingProfessor = await this.professorRepository.findOne({ 
      where: { userId, departmentId } 
    });
    if (existingProfessor) {
      throw new BadRequestException('El usuario ya tiene un perfil de profesor en este departamento');
    }

    const professor = this.professorRepository.create({
      userId,
      departmentId,
      specialization,
      employeeId,
      academicTitle,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    return this.professorRepository.save(professor);
  }

  // Asignar profesor a organizador (UserRole con rol ORGANIZER)
  async assignProfessorToOrganizer(assignDto: AssignOrganizerDto): Promise<Professor> {
    const { professorId, organizerRoleId } = assignDto;

    const professor = await this.professorRepository.findOne({
      where: { id: professorId },
      relations: ['organizerRoles']
    });

    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    const organizerRole = await this.userRoleRepository.findOne({ 
      where: { id: organizerRoleId },
      relations: ['role']
    });
    if (!organizerRole) {
      throw new NotFoundException('Rol de organizador no encontrado');
    }

    // Verificar que el rol es de tipo ORGANIZER
    if (organizerRole.role.code !== 'ORGANIZER') {
      throw new BadRequestException('El rol debe ser de tipo ORGANIZER');
    }

    // Verificar que no esté ya asignado
    const isAlreadyAssigned = professor.organizerRoles.some(role => role.id === organizerRoleId);
    if (isAlreadyAssigned) {
      throw new BadRequestException('El profesor ya está asignado a este organizador');
    }

    professor.organizerRoles.push(organizerRole);
    return this.professorRepository.save(professor);
  }

  // Obtener profesores por organizador
  async getProfessorsByOrganizer(organizerUserId: string): Promise<Professor[]> {
    return this.professorRepository
      .createQueryBuilder('professor')
      .leftJoinAndSelect('professor.user', 'user')
      .leftJoinAndSelect('professor.department', 'department')
      .leftJoinAndSelect('professor.organizerRoles', 'organizerRole')
      .leftJoinAndSelect('organizerRole.user', 'organizerUser')
      .where('organizerUser.id = :organizerUserId', { organizerUserId })
      .andWhere('professor.isActive = :isActive', { isActive: true })
      .getMany();
  }

  // Obtener profesores por departamento
  async getProfessorsByDepartment(departmentId: string): Promise<Professor[]> {
    return this.professorRepository.find({
      where: { departmentId, isActive: true },
      relations: ['user', 'department', 'organizerRoles']
    });
  }

  // Actualizar profesor
  async updateProfessor(id: string, updateDto: UpdateProfessorDto, currentUserId: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({ where: { id } });
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    Object.assign(professor, updateDto, { updatedBy: currentUserId });
    return this.professorRepository.save(professor);
  }

  // Desactivar profesor
  async deactivateProfessor(id: string, currentUserId: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({ where: { id } });
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    professor.isActive = false;
    professor.updatedBy = currentUserId;
    return this.professorRepository.save(professor);
  }

  // Obtener todos los profesores
  async findAll(): Promise<Professor[]> {
    return this.professorRepository.find({
      where: { isActive: true },
      relations: ['user', 'department', 'organizerRoles']
    });
  }

  // Obtener profesor por ID
  async findOne(id: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({
      where: { id },
      relations: ['user', 'department', 'organizerRoles']
    });

    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return professor;
  }

  // Crear usuario completo con rol PROFESSOR
  async createProfessorUser(createProfessorUserDto: CreateProfessorUserDto, currentUserId: string): Promise<Professor> {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      institutionId, 
      departmentId, 
      specialization,
      phone,
      dni 
    } = createProfessorUserDto;

    // Verificar que el email no existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con este email');
    }

    // Verificar que el departamento existe
    const department = await this.departmentRepository.findOne({ 
      where: { id: departmentId },
      relations: ['institution'] 
    });
    if (!department) {
      throw new NotFoundException('Departamento no encontrado');
    }

    // Verificar que el departamento pertenece a la institución especificada
    if (department.institution_id !== institutionId) {
      throw new BadRequestException('El departamento no pertenece a la institución especificada');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      document_number: dni,
      document_type: 'DNI',
      enabled: true,
      deleted: false,
      createdBy: currentUserId,
      updatedBy: currentUserId,
      last_login: new Date()
    });

    const savedUser = await this.userRepository.save(newUser);

    // Buscar o crear el rol PROFESSOR
    let professorRole = await this.roleRepository.findOne({ where: { code: 'PROFESSOR' } });
    if (!professorRole) {
      professorRole = this.roleRepository.create({
        code: 'PROFESSOR',
        description: 'Rol de Profesor',
        createdBy: currentUserId,
        updatedBy: currentUserId
      });
      professorRole = await this.roleRepository.save(professorRole);
    }

    // Crear la relación UserRole
    const userRole = this.userRoleRepository.create({
      user_id: savedUser.id,
      role_id: professorRole.id,
      institution_id: institutionId,
      department_id: departmentId,
      enabled: true,
      createdBy: currentUserId,
      updatedBy: currentUserId
    });

    await this.userRoleRepository.save(userRole);

    // Crear el perfil de profesor
    const professor = this.professorRepository.create({
      userId: savedUser.id,
      departmentId,
      specialization: specialization || 'Profesor',
      isActive: true,
      createdBy: currentUserId,
      updatedBy: currentUserId
    });

    return await this.professorRepository.save(professor);
  }
} // Force recompilation