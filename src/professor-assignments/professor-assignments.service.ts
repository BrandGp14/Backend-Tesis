import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProfessorUserAssignment } from './entities/professor-user-assignment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { AssignUsersToProfessorDto } from './dto/assign-users-to-professor.dto';
import { AssignmentResponseDto, ProfessorCapacityDto } from './dto/assignment-response.dto';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';

@Injectable()
export class ProfessorAssignmentsService {
  private readonly MAX_USERS_PER_PROFESSOR = 20;

  constructor(
    @InjectRepository(ProfessorUserAssignment)
    private readonly assignmentRepository: Repository<ProfessorUserAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async assignUsersToProfesor(
    assignDto: AssignUsersToProfessorDto,
    organizerUser: JwtDto
  ): Promise<AssignmentResponseDto[]> {
    
    // Validar que el organizador tiene permisos en el departamento
    await this.validateOrganizerPermissions(organizerUser.sub, assignDto.departmentId);

    // Validar que el profesor existe y tiene rol PROFESSOR
    const professor = await this.validateProfessor(assignDto.professorId, assignDto.departmentId);

    // Verificar capacidad del profesor
    await this.validateProfessorCapacity(assignDto.professorId, assignDto.userIds.length);

    // Validar que los usuarios existen y tienen rol USER
    const users = await this.validateUsers(assignDto.userIds, assignDto.departmentId);

    // Verificar que los usuarios no estén ya asignados a este profesor
    await this.validateNoExistingAssignments(assignDto.professorId, assignDto.userIds);

    // Crear las asignaciones
    const assignments: ProfessorUserAssignment[] = [];
    
    for (const userId of assignDto.userIds) {
      const assignment = ProfessorUserAssignment.fromDto({
        professorId: assignDto.professorId,
        userId: userId,
        organizerId: organizerUser.sub,
        departmentId: assignDto.departmentId,
        institutionId: assignDto.institutionId,
        assignmentNotes: assignDto.assignmentNotes
      }, organizerUser.sub);

      assignments.push(assignment);
    }

    // Guardar todas las asignaciones
    const savedAssignments = await this.assignmentRepository.save(assignments);

    // Retornar DTOs de respuesta
    return savedAssignments.map(assignment => assignment.toDto());
  }

  async getAssignmentsByProfessor(
    professorId: string,
    requestingUser: JwtDto,
    includeInactive: boolean = false
  ): Promise<AssignmentResponseDto[]> {
    
    // Validar que el profesor tiene rol PROFESSOR
    const professor = await this.userRepository.findOne({
      where: { id: professorId },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professor || !professor.userRoles || !professor.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Validar permisos: solo el mismo profesor o un organizador del departamento puede ver las asignaciones
    // Para obtener el departmentId, necesitamos buscar en las asignaciones del profesor
    const professorAssignment = await this.assignmentRepository.findOne({
      where: {
        professorId: professor.id,
        isActive: true,
        deleted: false
      },
      relations: ['department']
    });
    
    const departmentId = professorAssignment?.departmentId;
    if (departmentId) {
      await this.validateViewPermissions(requestingUser.sub, departmentId, professor.id);
    }

    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.professor', 'professor')
      .leftJoinAndSelect('professor.user', 'professorUser')
      .leftJoinAndSelect('assignment.user', 'assignedUser')
      .leftJoinAndSelect('assignment.department', 'department')
      .where('assignment.professorId = :professorId', { professorId })
      .andWhere('assignment.deleted = :deleted', { deleted: false });

    if (!includeInactive) {
      queryBuilder.andWhere('assignment.isActive = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('assignment.assignedDate', 'DESC');

    const assignments = await queryBuilder.getMany();
    
    return assignments.map(assignment => assignment.toDto());
  }

  async getAssignmentsByOrganizer(
    organizerId: string,
    departmentId?: string
  ): Promise<AssignmentResponseDto[]> {
    
    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.professor', 'professor')
      .leftJoinAndSelect('professor.user', 'professorUser')
      .leftJoinAndSelect('assignment.user', 'assignedUser')
      .leftJoinAndSelect('assignment.department', 'department')
      .where('assignment.organizerId = :organizerId', { organizerId })
      .andWhere('assignment.deleted = :deleted', { deleted: false })
      .andWhere('assignment.isActive = :isActive', { isActive: true });

    if (departmentId) {
      queryBuilder.andWhere('assignment.departmentId = :departmentId', { departmentId });
    }

    queryBuilder.orderBy('assignment.assignedDate', 'DESC');

    const assignments = await queryBuilder.getMany();
    
    return assignments.map(assignment => assignment.toDto());
  }

  async getProfessorCapacity(professorId: string): Promise<ProfessorCapacityDto> {
    // Verificar que el usuario tiene rol PROFESSOR
    const professor = await this.userRepository.findOne({
      where: { id: professorId },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professor || !professor.userRoles || !professor.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new NotFoundException('Profesor no encontrado');
    }

    const currentAssignments = await this.assignmentRepository.count({
      where: {
        professorId: professorId,
        isActive: true,
        deleted: false
      }
    });

    const availableSlots = this.MAX_USERS_PER_PROFESSOR - currentAssignments;
    const occupancyPercentage = Math.round((currentAssignments / this.MAX_USERS_PER_PROFESSOR) * 100);

    return {
      professorId: professor.id,
      professorInfo: {
        firstName: professor.firstName,
        lastName: professor.lastName,
        email: professor.email,
        specialization: 'Profesor' // Ya que no tenemos especialización en User
      },
      currentAssignments,
      maxCapacity: this.MAX_USERS_PER_PROFESSOR,
      availableSlots,
      occupancyPercentage,
      canAssignMore: availableSlots > 0
    };
  }

  async unassignUser(assignmentId: string, requestingUser: JwtDto): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, deleted: false },
      relations: ['professor']
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Validar permisos: solo el organizador que hizo la asignación puede desasignar
    if (assignment.organizerId !== requestingUser.sub) {
      throw new ForbiddenException('Solo el organizador que hizo la asignación puede desasignarla');
    }

    assignment.unassign(requestingUser.sub);
    await this.assignmentRepository.save(assignment);
  }

  async deleteAssignment(assignmentId: string, requestingUser: JwtDto): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, deleted: false }
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Validar permisos
    if (assignment.organizerId !== requestingUser.sub) {
      throw new ForbiddenException('Solo el organizador que hizo la asignación puede eliminarla');
    }

    assignment.delete(requestingUser.sub);
    await this.assignmentRepository.save(assignment);
  }

  async getAssignedUsersByProfessor(professorId: string): Promise<User[]> {
    const assignments = await this.assignmentRepository.find({
      where: {
        professorId: professorId,
        isActive: true,
        deleted: false
      },
      relations: ['user']
    });

    return assignments.map(assignment => assignment.user);
  }

  // Métodos privados de validación

  private async validateOrganizerPermissions(organizerId: string, departmentId: string): Promise<void> {
    const organizerRole = await this.userRoleRepository.findOne({
      where: {
        user_id: organizerId,
        department_id: departmentId,
        enabled: true,
        deleted: false
      },
      relations: ['role']
    });

    if (!organizerRole || organizerRole.role.code !== 'ORGANIZER') {
      throw new ForbiddenException('No tiene permisos de organizador en este departamento');
    }
  }

  private async validateProfessor(professorId: string, departmentId: string): Promise<User> {
    // Verificar que el usuario tiene rol PROFESSOR
    const professor = await this.userRepository.findOne({
      where: { id: professorId },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professor || !professor.userRoles || !professor.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Verificar que el profesor tiene permisos en el departamento
    const professorRole = await this.userRoleRepository.findOne({
      where: {
        user_id: professorId,
        department_id: departmentId,
        enabled: true,
        deleted: false
      },
      relations: ['role']
    });

    if (!professorRole || professorRole.role.code !== 'PROFESSOR') {
      throw new BadRequestException('El profesor no pertenece al departamento especificado');
    }

    return professor;
  }

  private async validateProfessorCapacity(professorId: string, newAssignmentsCount: number): Promise<void> {
    const currentAssignments = await this.assignmentRepository.count({
      where: {
        professorId: professorId,
        isActive: true,
        deleted: false
      }
    });

    const totalAfterAssignment = currentAssignments + newAssignmentsCount;

    if (totalAfterAssignment > this.MAX_USERS_PER_PROFESSOR) {
      throw new BadRequestException(
        `El profesor excedería la capacidad máxima. Actual: ${currentAssignments}, ` +
        `Intentando agregar: ${newAssignmentsCount}, Máximo: ${this.MAX_USERS_PER_PROFESSOR}`
      );
    }
  }

  private async validateUsers(userIds: string[], departmentId: string): Promise<User[]> {
    // Verificar que los usuarios existen
    const users = await this.userRepository.find({
      where: { id: In(userIds) }
    });

    if (users.length !== userIds.length) {
      const foundIds = users.map(u => u.id);
      const missingIds = userIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Usuarios no encontrados: ${missingIds.join(', ')}`);
    }

    // Verificar que tienen rol USER en el departamento
    const userRoles = await this.userRoleRepository.find({
      where: {
        user_id: In(userIds),
        department_id: departmentId,
        enabled: true,
        deleted: false
      },
      relations: ['role']
    });

    const validUserRoles = userRoles.filter(ur => ur.role.code === 'USER');
    
    if (validUserRoles.length !== userIds.length) {
      throw new BadRequestException('Todos los usuarios deben tener rol USER en el departamento especificado');
    }

    return users;
  }

  private async validateNoExistingAssignments(professorId: string, userIds: string[]): Promise<void> {
    const existingAssignments = await this.assignmentRepository.find({
      where: {
        professorId: professorId,
        userId: In(userIds),
        isActive: true,
        deleted: false
      },
      relations: ['user']
    });

    if (existingAssignments.length > 0) {
      const alreadyAssigned = existingAssignments.map(a => `${a.user.firstName} ${a.user.lastName}`);
      throw new BadRequestException(`Los siguientes usuarios ya están asignados a este profesor: ${alreadyAssigned.join(', ')}`);
    }
  }

  private async validateViewPermissions(requestingUserId: string, departmentId: string, professorUserId?: string): Promise<void> {
    // El mismo profesor puede ver sus asignaciones
    if (professorUserId && requestingUserId === professorUserId) {
      return;
    }

    // Un organizador del departamento puede ver asignaciones
    const organizerRole = await this.userRoleRepository.findOne({
      where: {
        user_id: requestingUserId,
        department_id: departmentId,
        enabled: true,
        deleted: false
      },
      relations: ['role']
    });

    if (organizerRole && organizerRole.role.code === 'ORGANIZER') {
      return;
    }

    throw new ForbiddenException('No tiene permisos para ver estas asignaciones');
  }
}