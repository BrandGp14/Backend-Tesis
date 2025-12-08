import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query
} from '@nestjs/common';
import { ProfessorReportsService } from './professor-reports.service';
import { RaffleReportRequestDto } from './dto/raffle-report-request.dto';
import { RaffleReportResponseDto } from './dto/raffle-report-response.dto';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';
import { ApiResponse as ApiCommonResponse } from '../common/dto/api.response.dto';

@ApiTags('professor-reports') 
@ApiBearerAuth()
@UseGuards(JwtAuthService)
@Controller('professor-reports')
export class ProfessorReportsController {
  constructor(
    private readonly professorReportsService: ProfessorReportsService
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
}