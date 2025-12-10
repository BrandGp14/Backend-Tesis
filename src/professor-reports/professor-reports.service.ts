import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Raffle } from '../raffles/entities/raffle.entity';
import { ProfessorUserAssignment } from '../professor-assignments/entities/professor-user-assignment.entity';
import { User } from '../users/entities/user.entity';
import { RaffleReportRequestDto } from './dto/raffle-report-request.dto';
import { 
  RaffleReportResponseDto, 
  RaffleStatisticsDto, 
  RaffleDetailDto 
} from './dto/raffle-report-response.dto';
import { 
  StudentRaffleReportRequestDto,
  StudentRaffleReportResponseDto,
  UserRaffleDetailDto
} from './dto/student-raffle-report.dto';
import { RaffleStatusReference } from '../raffles/type/raffle.status.reference';
import { RaffleNumberStatus } from '../raffles/enums/raffle-number-status.enum';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';

@Injectable()
export class ProfessorReportsService {
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    @InjectRepository(ProfessorUserAssignment)
    private readonly assignmentRepository: Repository<ProfessorUserAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateRaffleReport(
    reportRequest: RaffleReportRequestDto,
    user: JwtDto
  ): Promise<RaffleReportResponseDto> {
    // Verificar que el usuario tiene rol PROFESSOR
    const professorUser = await this.userRepository.findOne({
      where: { id: user.sub },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new ForbiddenException('Solo los profesores pueden generar reportes');
    }

    // Obtener información del departamento del profesor desde assignments
    const assignment = await this.assignmentRepository.findOne({
      where: { 
        userId: professorUser.id,
        isActive: true,
        deleted: false 
      },
      relations: ['department']
    });

    if (!assignment) {
      throw new ForbiddenException('Profesor no tiene asignaciones activas');
    }

    // Construir query base
    const queryBuilder = this.raffleRepository
      .createQueryBuilder('raffle')
      .leftJoinAndSelect('raffle.institution', 'institution')
      .leftJoinAndSelect('raffle.department', 'department')
      .leftJoinAndSelect('raffle.user', 'organizer')
      .leftJoinAndSelect('raffle.raffleNumbers', 'raffleNumbers')
      .where('raffle.deleted = :deleted', { deleted: false });

    // Aplicar filtros
    if (reportRequest.departmentId) {
      // Verificar que el profesor tiene acceso a este departamento
      if (assignment.departmentId !== reportRequest.departmentId) {
        throw new ForbiddenException('No tiene permisos para acceder a este departamento');
      }
      queryBuilder.andWhere('raffle.institution_department_id = :departmentId', {
        departmentId: reportRequest.departmentId
      });
    } else {
      // Si no se especifica departamento, filtrar por el departamento del profesor
      queryBuilder.andWhere('raffle.institution_department_id = :departmentId', {
        departmentId: assignment.departmentId
      });
    }

    if (reportRequest.organizerId) {
      queryBuilder.andWhere('raffle.organizer_id = :organizerId', {
        organizerId: reportRequest.organizerId
      });
    }

    // Aplicar filtros de fecha
    if (reportRequest.startDate) {
      queryBuilder.andWhere('raffle.startDate >= :startDate', {
        startDate: new Date(reportRequest.startDate)
      });
    }

    if (reportRequest.endDate) {
      queryBuilder.andWhere('raffle.endDate <= :endDate', {
        endDate: new Date(reportRequest.endDate)
      });
    }

    // Ejecutar query
    const raffles = await queryBuilder.getMany();

    if (raffles.length === 0) {
      throw new NotFoundException('No se encontraron rifas para los criterios especificados');
    }

    // Calcular estadísticas
    const statistics = this.calculateStatistics(raffles);
    
    // Generar detalles de rifas
    const raffleDetails = raffles.map(raffle => this.mapRaffleToDetail(raffle));

    const report: RaffleReportResponseDto = {
      statistics,
      raffleDetails,
      generatedAt: new Date(),
      reportPeriodStart: reportRequest.startDate ? new Date(reportRequest.startDate) : undefined,
      reportPeriodEnd: reportRequest.endDate ? new Date(reportRequest.endDate) : undefined
    };

    return report;
  }

  private calculateStatistics(raffles: Raffle[]): RaffleStatisticsDto {
    const totalRaffles = raffles.length;
    const activeRaffles = raffles.filter(r => r.status === RaffleStatusReference.STARTED).length;
    const completedRaffles = raffles.filter(r => r.status === RaffleStatusReference.FINISHED).length;
    const cancelledRaffles = raffles.filter(r => r.status === RaffleStatusReference.CANCELLED).length;

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalTicketsAvailable = 0;

    raffles.forEach(raffle => {
      const soldCount = raffle.raffleNumbers 
        ? raffle.raffleNumbers.filter(rn => rn.status === RaffleNumberStatus.SOLD && !rn.deleted).length 
        : raffle.sold;
      
      totalTicketsSold += soldCount;
      totalTicketsAvailable += raffle.available;
      totalRevenue += soldCount * raffle.price;
    });

    const averageOccupancyRate = totalTicketsAvailable > 0 
      ? (totalTicketsSold / totalTicketsAvailable) * 100 
      : 0;

    return {
      totalRaffles,
      activeRaffles,
      completedRaffles,
      cancelledRaffles,
      totalRevenue,
      totalTicketsSold,
      totalTicketsAvailable,
      averageOccupancyRate: Math.round(averageOccupancyRate * 100) / 100
    };
  }

  private mapRaffleToDetail(raffle: Raffle): RaffleDetailDto {
    const ticketsSold = raffle.raffleNumbers 
      ? raffle.raffleNumbers.filter(rn => rn.status === RaffleNumberStatus.SOLD && !rn.deleted).length 
      : raffle.sold;

    return {
      id: raffle.id,
      title: raffle.title,
      status: RaffleStatusReference[raffle.status] as string,
      ticketsSold,
      ticketsAvailable: raffle.available,
      revenue: ticketsSold * raffle.price,
      startDate: raffle.startDate,
      endDate: raffle.endDate,
      organizer: raffle.user ? `${raffle.user.firstName} ${raffle.user.lastName}` : 'N/A',
      department: raffle.department ? raffle.department.description : 'N/A'
    };
  }

  async getProfessorDashboardStats(user: JwtDto) {
    // Verificar que el usuario tiene rol PROFESSOR
    const professorUser = await this.userRepository.findOne({
      where: { id: user.sub },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new ForbiddenException('Solo los profesores pueden acceder a estas estadísticas');
    }

    // Obtener información del departamento del profesor desde assignments
    const assignment = await this.assignmentRepository.findOne({
      where: { 
        userId: professorUser.id,
        isActive: true,
        deleted: false 
      },
      relations: ['department']
    });

    if (!assignment) {
      throw new ForbiddenException('Profesor no tiene asignaciones activas');
    }

    // Obtener rifas del departamento del profesor
    const raffles = await this.raffleRepository.find({
      where: {
        institution_department_id: assignment.departmentId,
        deleted: false
      },
      relations: ['raffleNumbers']
    });

    const statistics = this.calculateStatistics(raffles);
    
    return {
      departmentName: assignment.department?.description || 'N/A',
      ...statistics,
      generatedAt: new Date()
    };
  }

  /**
   * Genera reporte de rifas de usuarios asignados al profesor
   */
  async generateStudentRaffleReport(
    reportRequest: StudentRaffleReportRequestDto,
    user: JwtDto
  ): Promise<StudentRaffleReportResponseDto> {
    // Verificar que el usuario tiene rol PROFESSOR
    const professorUser = await this.userRepository.findOne({
      where: { id: user.sub },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new ForbiddenException('Solo los profesores pueden generar reportes');
    }

    // Obtener información del profesor desde assignments
    const professorAssignment = await this.assignmentRepository.findOne({
      where: { 
        userId: professorUser.id,
        isActive: true,
        deleted: false 
      },
      relations: ['department']
    });

    if (!professorAssignment) {
      throw new ForbiddenException('Profesor no tiene asignaciones activas');
    }

    // Obtener usuarios asignados al profesor
    let assignedUsers: User[] = [];
    
    if (reportRequest.userIds && reportRequest.userIds.length > 0) {
      // Verificar que los usuarios especificados están asignados al profesor
      const assignments = await this.assignmentRepository.find({
        where: {
          professorId: professorUser.id,
          userId: In(reportRequest.userIds),
          isActive: true,
          deleted: false
        },
        relations: ['user']
      });

      if (assignments.length !== reportRequest.userIds.length) {
        throw new BadRequestException('Algunos usuarios especificados no están asignados a este profesor');
      }

      assignedUsers = assignments.map(a => a.user);
    } else {
      // Obtener todos los usuarios asignados al profesor
      const assignments = await this.assignmentRepository.find({
        where: {
          professorId: professorUser.id,
          isActive: true,
          deleted: false
        },
        relations: ['user']
      });

      assignedUsers = assignments.map(a => a.user);
    }

    if (assignedUsers.length === 0) {
      throw new NotFoundException('No hay usuarios asignados a este profesor');
    }

    // Generar detalles por usuario
    const userDetails: UserRaffleDetailDto[] = [];
    let totalRaffles = 0;
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalTicketsAvailable = 0;

    for (const assignedUser of assignedUsers) {
      const userDetail = await this.generateUserRaffleDetail(
        assignedUser,
        professorAssignment.departmentId,
        reportRequest
      );
      
      userDetails.push(userDetail);
      totalRaffles += userDetail.totalRaffles;
      totalRevenue += userDetail.totalRevenue;
      totalTicketsSold += userDetail.totalTicketsSold;
      totalTicketsAvailable += userDetail.raffleDetails.reduce((sum, r) => sum + r.ticketsAvailable, 0);
    }

    // Calcular estadísticas generales
    const generalStatistics = {
      totalUsers: assignedUsers.length,
      totalRaffles,
      totalRevenue,
      totalTicketsSold,
      totalTicketsAvailable,
      averageRafflesPerUser: assignedUsers.length > 0 ? Math.round((totalRaffles / assignedUsers.length) * 100) / 100 : 0,
      averageRevenuePerUser: assignedUsers.length > 0 ? Math.round((totalRevenue / assignedUsers.length) * 100) / 100 : 0,
      overallOccupancyRate: totalTicketsAvailable > 0 ? Math.round(((totalTicketsSold / totalTicketsAvailable) * 100) * 100) / 100 : 0
    };

    return {
      generalStatistics,
      userDetails,
      professorInfo: {
        id: professorUser.id,
        name: `${professorUser.firstName} ${professorUser.lastName}`,
        email: professorUser.email,
        department: professorAssignment.department?.description || 'N/A'
      },
      generatedAt: new Date(),
      reportPeriodStart: reportRequest.startDate ? new Date(reportRequest.startDate) : undefined,
      reportPeriodEnd: reportRequest.endDate ? new Date(reportRequest.endDate) : undefined,
      totalUsers: assignedUsers.length
    };
  }

  /**
   * Genera detalle de rifas para un usuario específico
   */
  private async generateUserRaffleDetail(
    user: User,
    departmentId: string,
    reportRequest: StudentRaffleReportRequestDto
  ): Promise<UserRaffleDetailDto> {
    
    const queryBuilder = this.raffleRepository
      .createQueryBuilder('raffle')
      .leftJoinAndSelect('raffle.raffleNumbers', 'raffleNumbers')
      .where('raffle.organizer_id = :userId', { userId: user.id })
      .andWhere('raffle.institution_department_id = :departmentId', { departmentId })
      .andWhere('raffle.deleted = :deleted', { deleted: false });

    // Aplicar filtros de fecha
    if (reportRequest.startDate) {
      queryBuilder.andWhere('raffle.startDate >= :startDate', {
        startDate: new Date(reportRequest.startDate)
      });
    }

    if (reportRequest.endDate) {
      queryBuilder.andWhere('raffle.endDate <= :endDate', {
        endDate: new Date(reportRequest.endDate)
      });
    }

    // Aplicar filtro de estado
    if (reportRequest.raffleStatus) {
      queryBuilder.andWhere('raffle.status = :status', {
        status: reportRequest.raffleStatus
      });
    }

    // Filtro de rifas activas solamente
    if (reportRequest.activeRafflesOnly) {
      queryBuilder.andWhere('raffle.status = :activeStatus', {
        activeStatus: RaffleStatusReference.STARTED
      });
    }

    const raffles = await queryBuilder.getMany();

    // Calcular estadísticas del usuario
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let activeRaffles = 0;
    let completedRaffles = 0;
    const raffleDetails: any[] = [];

    raffles.forEach(raffle => {
      const soldCount = raffle.raffleNumbers 
        ? raffle.raffleNumbers.filter(rn => rn.status === RaffleNumberStatus.SOLD && !rn.deleted).length 
        : raffle.sold;
      
      totalTicketsSold += soldCount;
      totalRevenue += soldCount * raffle.price;

      if (raffle.status === RaffleStatusReference.STARTED) {
        activeRaffles++;
      } else if (raffle.status === RaffleStatusReference.FINISHED) {
        completedRaffles++;
      }

      const occupancyRate = raffle.available > 0 ? Math.round(((soldCount / raffle.available) * 100) * 100) / 100 : 0;

      raffleDetails.push({
        id: raffle.id,
        title: raffle.title,
        status: RaffleStatusReference[raffle.status] as string,
        ticketsSold: soldCount,
        ticketsAvailable: raffle.available,
        revenue: soldCount * raffle.price,
        startDate: raffle.startDate,
        endDate: raffle.endDate,
        occupancyRate
      });
    });

    const averageOccupancyRate = raffleDetails.length > 0 
      ? Math.round((raffleDetails.reduce((sum, r) => sum + r.occupancyRate, 0) / raffleDetails.length) * 100) / 100
      : 0;

    return {
      userId: user.id,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      totalRaffles: raffles.length,
      totalTicketsSold,
      totalRevenue,
      activeRaffles,
      completedRaffles,
      averageOccupancyRate,
      raffleDetails
    };
  }

  /**
   * Obtiene usuarios asignados a un profesor para reportes
   */
  async getAssignedUsersForReports(user: JwtDto): Promise<User[]> {
    // Verificar que el usuario tiene rol PROFESSOR
    const professorUser = await this.userRepository.findOne({
      where: { id: user.sub },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new ForbiddenException('Solo los profesores pueden acceder a esta información');
    }

    const assignments = await this.assignmentRepository.find({
      where: {
        professorId: professorUser.id,
        isActive: true,
        deleted: false
      },
      relations: ['user']
    });

    return assignments.map(assignment => assignment.user);
  }

  /**
   * Verifica si un profesor tiene usuarios asignados
   */
  async hasAssignedUsers(professorId: string): Promise<boolean> {
    const count = await this.assignmentRepository.count({
      where: {
        professorId: professorId,
        isActive: true,
        deleted: false
      }
    });

    return count > 0;
  }
} 
