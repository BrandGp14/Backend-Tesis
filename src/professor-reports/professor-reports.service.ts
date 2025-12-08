import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Raffle } from '../raffles/entities/raffle.entity';
import { Professor } from '../professors/entities/professor.entity';
import { RaffleReportRequestDto } from './dto/raffle-report-request.dto';
import { 
  RaffleReportResponseDto, 
  RaffleStatisticsDto, 
  RaffleDetailDto 
} from './dto/raffle-report-response.dto';
import { RaffleStatusReference } from '../raffles/type/raffle.status.reference';
import { RaffleNumberStatus } from '../raffles/enums/raffle-number-status.enum';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';

@Injectable()
export class ProfessorReportsService {
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
  ) {}

  async generateRaffleReport(
    reportRequest: RaffleReportRequestDto,
    user: JwtDto
  ): Promise<RaffleReportResponseDto> {
    // Verificar que el usuario es un profesor
    const professor = await this.professorRepository.findOne({
      where: { userId: user.sub },
      relations: ['department', 'user', 'organizerRoles']
    });

    if (!professor) {
      throw new ForbiddenException('Solo los profesores pueden generar reportes');
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
      if (professor.departmentId !== reportRequest.departmentId) {
        throw new ForbiddenException('No tiene permisos para acceder a este departamento');
      }
      queryBuilder.andWhere('raffle.institution_department_id = :departmentId', {
        departmentId: reportRequest.departmentId
      });
    } else {
      // Si no se especifica departamento, filtrar por el departamento del profesor
      queryBuilder.andWhere('raffle.institution_department_id = :departmentId', {
        departmentId: professor.departmentId
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
    const professor = await this.professorRepository.findOne({
      where: { userId: user.sub },
      relations: ['department']
    });

    if (!professor) {
      throw new ForbiddenException('Solo los profesores pueden acceder a estas estadísticas');
    }

    // Obtener rifas del departamento del profesor
    const raffles = await this.raffleRepository.find({
      where: {
        institution_department_id: professor.departmentId,
        deleted: false
      },
      relations: ['raffleNumbers']
    });

    const statistics = this.calculateStatistics(raffles);
    
    return {
      departmentName: professor.department?.description || 'N/A',
      ...statistics,
      generatedAt: new Date()
    };
  }
} 
