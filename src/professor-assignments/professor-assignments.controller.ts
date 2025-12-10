import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { ProfessorAssignmentsService } from './professor-assignments.service';
import { AssignUsersToProfessorDto } from './dto/assign-users-to-professor.dto';
import { AssignmentResponseDto, ProfessorCapacityDto } from './dto/assignment-response.dto';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';
import { ApiResponse as ApiCommonResponse } from '../common/dto/api.response.dto';

@ApiTags('professor-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthService)
@Controller('professor-assignments')
export class ProfessorAssignmentsController {
  constructor(
    private readonly professorAssignmentsService: ProfessorAssignmentsService
  ) {}

  @Post('assign')
  @ApiOperation({ 
    summary: 'Asignar usuarios a un profesor',
    description: 'Permite a un organizador asignar hasta 20 usuarios con rol USER a un profesor específico'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Usuarios asignados exitosamente',
    type: [AssignmentResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Datos inválidos o límite de capacidad excedido' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Sin permisos de organizador en el departamento' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Profesor o usuarios no encontrados' 
  })
  async assignUsersToProfesor(
    @Body() assignDto: AssignUsersToProfessorDto,
    @Request() req: { user: JwtDto }
  ) {
    const assignments = await this.professorAssignmentsService.assignUsersToProfesor(
      assignDto,
      req.user
    );
    
    return ApiCommonResponse.success({
      data: assignments,
      message: `${assignments.length} usuarios asignados exitosamente al profesor`
    });
  }

  @Get('professor/:professorId/assignments')
  @ApiOperation({ 
    summary: 'Obtener asignaciones de un profesor',
    description: 'Lista todos los usuarios asignados a un profesor específico'
  })
  @ApiParam({
    name: 'professorId',
    description: 'ID del profesor',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({
    name: 'includeInactive',
    description: 'Incluir asignaciones inactivas',
    example: false,
    required: false,
    type: Boolean
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Asignaciones obtenidas exitosamente',
    type: [AssignmentResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Profesor no encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Sin permisos para ver las asignaciones' 
  })
  async getAssignmentsByProfessor(
    @Param('professorId') professorId: string,
    @Query('includeInactive') includeInactive: boolean = false,
    @Request() req: { user: JwtDto }
  ) {
    const assignments = await this.professorAssignmentsService.getAssignmentsByProfessor(
      professorId,
      req.user,
      includeInactive
    );
    
    return ApiCommonResponse.success({
      data: assignments,
      message: `${assignments.length} asignaciones encontradas`
    });
  }

  @Get('organizer/my-assignments')
  @ApiOperation({ 
    summary: 'Obtener asignaciones realizadas por el organizador',
    description: 'Lista todas las asignaciones realizadas por el organizador autenticado'
  })
  @ApiQuery({
    name: 'departmentId',
    description: 'Filtrar por departamento específico',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Asignaciones del organizador obtenidas exitosamente',
    type: [AssignmentResponseDto]
  })
  async getMyAssignments(
    @Query('departmentId') departmentId: string,
    @Request() req: { user: JwtDto }
  ) {
    const assignments = await this.professorAssignmentsService.getAssignmentsByOrganizer(
      req.user.sub,
      departmentId
    );
    
    return ApiCommonResponse.success({
      data: assignments,
      message: `${assignments.length} asignaciones encontradas`
    });
  }

  @Get('professor/:professorId/capacity')
  @ApiOperation({ 
    summary: 'Verificar capacidad de un profesor',
    description: 'Obtiene información sobre la capacidad actual y disponible de un profesor (máximo 20 usuarios)'
  })
  @ApiParam({
    name: 'professorId',
    description: 'ID del profesor',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Información de capacidad obtenida exitosamente',
    type: ProfessorCapacityDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Profesor no encontrado' 
  })
  async getProfessorCapacity(@Param('professorId') professorId: string) {
    const capacity = await this.professorAssignmentsService.getProfessorCapacity(professorId);
    
    return ApiCommonResponse.success({
      data: capacity,
      message: 'Información de capacidad obtenida exitosamente'
    });
  }

  @Delete('assignment/:assignmentId/unassign')
  @ApiOperation({ 
    summary: 'Desasignar usuario (desactivar asignación)',
    description: 'Desactiva una asignación específica sin eliminarla permanentemente'
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID de la asignación',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Usuario desasignado exitosamente' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Asignación no encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Solo el organizador que creó la asignación puede desasignarla' 
  })
  async unassignUser(
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: JwtDto }
  ) {
    await this.professorAssignmentsService.unassignUser(assignmentId, req.user);
    
    return ApiCommonResponse.success({
      data: null,
      message: 'Usuario desasignado exitosamente'
    });
  }

  @Delete('assignment/:assignmentId')
  @ApiOperation({ 
    summary: 'Eliminar asignación permanentemente',
    description: 'Elimina permanentemente una asignación (soft delete)'
  })
  @ApiParam({
    name: 'assignmentId',
    description: 'ID de la asignación',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Asignación eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Asignación no encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Solo el organizador que creó la asignación puede eliminarla' 
  })
  async deleteAssignment(
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: JwtDto }
  ) {
    await this.professorAssignmentsService.deleteAssignment(assignmentId, req.user);
    
    return ApiCommonResponse.success({
      data: null,
      message: 'Asignación eliminada exitosamente'
    });
  }

  @Get('professor/:professorId/users')
  @ApiOperation({ 
    summary: 'Obtener usuarios asignados a un profesor (solo datos básicos)',
    description: 'Lista simplificada de usuarios asignados actualmente a un profesor'
  })
  @ApiParam({
    name: 'professorId',
    description: 'ID del profesor',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de usuarios asignados obtenida exitosamente'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Profesor no encontrado' 
  })
  async getAssignedUsers(@Param('professorId') professorId: string) {
    const users = await this.professorAssignmentsService.getAssignedUsersByProfessor(professorId);
    
    const simplifiedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }));
    
    return ApiCommonResponse.success({
      data: simplifiedUsers,
      message: `${users.length} usuarios asignados encontrados`
    });
  }
}