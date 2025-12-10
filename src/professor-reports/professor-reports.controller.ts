import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  HttpStatus
} from '@nestjs/common';
import { ProfessorReportsService } from './professor-reports.service';
import { ReportEmailService } from './services/report-email.service';
import { RaffleReportRequestDto } from './dto/raffle-report-request.dto';
import { RaffleReportResponseDto } from './dto/raffle-report-response.dto';
import { StudentRaffleReportRequestDto, StudentRaffleReportResponseDto, EmailReportRequestDto } from './dto/student-raffle-report.dto';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';
import { ApiResponse as ApiCommonResponse } from '../common/dto/api.response.dto';

@ApiTags('professor-reports') 
@ApiBearerAuth()
@UseGuards(JwtAuthService)
@Controller('professor-reports')
export class ProfessorReportsController {
  constructor(
    private readonly professorReportsService: ProfessorReportsService,
    private readonly reportEmailService: ReportEmailService
  ) {}

  @Post('raffles')
  @ApiOperation({ 
    summary: 'Generar reporte de rifas',
    description: 'Permite a los profesores generar reportes estadísticos de rifas con filtros personalizables'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Reporte generado exitosamente',
    type: RaffleReportResponseDto
  })
  @ApiResponse({ status: 403, description: 'Solo profesores pueden generar reportes' })
  @ApiResponse({ status: 404, description: 'No se encontraron rifas para los criterios especificados' })
  async generateRaffleReport(
    @Body() reportRequest: RaffleReportRequestDto,
    @Request() req: { user: JwtDto }
  ) {
    const report = await this.professorReportsService.generateRaffleReport(
      reportRequest,
      req.user
    );
    return ApiCommonResponse.success(report);
  }

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Obtener estadísticas del dashboard del profesor',
    description: 'Obtiene estadísticas generales del departamento del profesor para el dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente'
  })
  @ApiResponse({ status: 403, description: 'Solo profesores pueden acceder a estas estadísticas' })
  async getDashboardStats(@Request() req: { user: JwtDto }) {
    const stats = await this.professorReportsService.getProfessorDashboardStats(req.user);
    return ApiCommonResponse.success(stats);
  }

  @Get('raffles/quick-report')
  @ApiOperation({ 
    summary: 'Generar reporte rápido de rifas',
    description: 'Genera un reporte básico sin filtros avanzados usando query parameters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte rápido generado exitosamente'
  })
  async generateQuickReport(
    @Request() req: { user: JwtDto },
    @Query('organizerId') organizerId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const reportRequest: RaffleReportRequestDto = {
      organizerId,
      departmentId,
      startDate,
      endDate
    };

    const report = await this.professorReportsService.generateRaffleReport(
      reportRequest,
      req.user
    );
    
    return ApiCommonResponse.success(report);
  }

  @Post('student-raffles')
  @ApiOperation({ 
    summary: 'Generar reporte de rifas de usuarios asignados',
    description: 'Permite a los profesores generar reportes detallados de las rifas gestionadas por los usuarios asignados'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Reporte de usuarios asignados generado exitosamente',
    type: StudentRaffleReportResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Solo profesores pueden generar reportes de usuarios asignados' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'No hay usuarios asignados a este profesor' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Algunos usuarios especificados no están asignados a este profesor' 
  })
  async generateStudentRaffleReport(
    @Body() reportRequest: StudentRaffleReportRequestDto,
    @Request() req: { user: JwtDto }
  ) {
    const report = await this.professorReportsService.generateStudentRaffleReport(
      reportRequest,
      req.user
    );
    return ApiCommonResponse.success({
      data: report,
      message: `Reporte generado para ${report.totalUsers} usuarios asignados`
    });
  }

  @Get('assigned-users')
  @ApiOperation({ 
    summary: 'Obtener usuarios asignados al profesor',
    description: 'Lista los usuarios actualmente asignados al profesor para generar reportes'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de usuarios asignados obtenida exitosamente'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Solo profesores pueden acceder a esta información' 
  })
  async getAssignedUsers(@Request() req: { user: JwtDto }) {
    const users = await this.professorReportsService.getAssignedUsersForReports(req.user);
    
    const simplifiedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`
    }));
    
    return ApiCommonResponse.success({
      data: simplifiedUsers,
      message: `${users.length} usuarios asignados encontrados`
    });
  }

  @Post('email-report')
  @ApiOperation({ 
    summary: 'Enviar reporte por email al organizador',
    description: 'Envía un reporte detallado por email al organizador especificado con opción de adjuntar PDF'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Reporte enviado por email exitosamente'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Profesor u organizador no encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Error en el envío del email' 
  })
  async sendReportByEmail(
    @Body() emailRequest: EmailReportRequestDto,
    @Request() req: { user: JwtDto }
  ) {
    const result = await this.reportEmailService.sendReportToOrganizer(
      emailRequest,
      req.user.sub
    );
    
    if (result.success) {
      return ApiCommonResponse.success({
        data: { emailLogId: result.emailLogId },
        message: result.message
      });
    } else {
      return ApiCommonResponse.error(
        result.message,
        400
      );
    }
  }

  @Get('email-history')
  @ApiOperation({ 
    summary: 'Obtener historial de emails enviados',
    description: 'Lista todos los emails de reportes enviados por el profesor con filtros de fecha'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Fecha de inicio para filtrar historial',
    example: '2025-01-01',
    required: false
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Fecha de fin para filtrar historial',
    example: '2025-12-31',
    required: false
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Historial de emails obtenido exitosamente'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Profesor no encontrado' 
  })
  async getEmailHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: { user: JwtDto }
  ) {
    const history = await this.reportEmailService.getEmailHistory(
      req.user.sub,
      startDate,
      endDate
    );
    
    return ApiCommonResponse.success({
      data: history,
      message: `${history.length} registros de email encontrados`
    });
  }

  @Post('retry-email/:emailLogId')
  @ApiOperation({ 
    summary: 'Reintentar envío de email fallido',
    description: 'Reintenta el envío de un email que falló previamente (máximo 3 intentos)'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Email reenviado exitosamente'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Log de email no encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'No se puede reintentar este email' 
  })
  async retryEmailSend(
    @Request() req: { user: JwtDto },
    @Query('emailLogId') emailLogId: string
  ) {
    const result = await this.reportEmailService.retryFailedEmail(
      emailLogId,
      req.user.sub
    );
    
    if (result.success) {
      return ApiCommonResponse.success({
        data: null,
        message: result.message
      });
    } else {
      return ApiCommonResponse.error(result.message, 400);
    }
  }
}