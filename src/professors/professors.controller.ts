import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProfessorsService } from './professors.service';
import { CreateProfessorDto, AssignOrganizerDto, UpdateProfessorDto, CreateProfessorUserDto } from './dto';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtDto } from '../jwt-auth/dto/jwt.dto';
import { ApiResponse as ApiCommonResponse } from '../common/dto/api.response.dto';

@ApiTags('professors')
@ApiBearerAuth()
@UseGuards(JwtAuthService)
@Controller('professors')
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo profesor' })
  @ApiResponse({ status: 201, description: 'Profesor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario o departamento no encontrado' })
  async create(@Body() createProfessorDto: CreateProfessorDto, @Request() req: { user: JwtDto }) {
    const professor = await this.professorsService.createProfessor(createProfessorDto, req.user.sub);
    return ApiCommonResponse.success(professor);
  }

  @Post('create-user')
  @ApiOperation({ 
    summary: 'Crear usuario completo con rol PROFESSOR',
    description: 'Crea un usuario completo con rol PROFESSOR y su perfil de profesor asociado. Este endpoint permite crear tanto el usuario como el perfil de profesor en una sola operación.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario profesor creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-profesor' },
            userId: { type: 'string', example: 'uuid-usuario' },
            departmentId: { type: 'string', example: 'uuid-departamento' },
            specialization: { type: 'string', example: 'Ingeniería de Sistemas' },
            isActive: { type: 'boolean', example: true },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string', example: 'profesor.sistemas@tecsup.edu.pe' },
                firstName: { type: 'string', example: 'Dr. Juan Carlos' },
                lastName: { type: 'string', example: 'Pérez Mendoza' },
                role: { type: 'string', example: 'PROFESSOR' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email ya existe',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Ya existe un usuario con este email' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Departamento o institución no encontrada',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Departamento no encontrado' }
      }
    }
  })
  async createProfessorUser(
    @Body() createProfessorUserDto: CreateProfessorUserDto, 
    @Request() req: { user: JwtDto }
  ) {
    const professor = await this.professorsService.createProfessorUser(createProfessorUserDto, req.user.sub);
    return ApiCommonResponse.success(professor);
  }

  @Post('assign-organizer')
  @ApiOperation({ summary: 'Asignar profesor a organizador' })
  @ApiResponse({ status: 200, description: 'Profesor asignado exitosamente' })
  @ApiResponse({ status: 400, description: 'Asignación inválida' })
  @ApiResponse({ status: 404, description: 'Profesor u organizador no encontrado' })
  assignToOrganizer(@Body() assignOrganizerDto: AssignOrganizerDto) {
    return this.professorsService.assignProfessorToOrganizer(assignOrganizerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los profesores' })
  @ApiResponse({ status: 200, description: 'Lista de profesores obtenida exitosamente' })
  findAll() {
    return this.professorsService.findAll();
  }

  @Get('by-organizer/:organizerUserId')
  @ApiOperation({ summary: 'Obtener profesores por organizador' })
  @ApiResponse({ status: 200, description: 'Profesores del organizador obtenidos exitosamente' })
  findByOrganizer(@Param('organizerUserId') organizerUserId: string) {
    return this.professorsService.getProfessorsByOrganizer(organizerUserId);
  }

  @Get('by-department/:departmentId')
  @ApiOperation({ summary: 'Obtener profesores por departamento' })
  @ApiResponse({ status: 200, description: 'Profesores del departamento obtenidos exitosamente' })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.professorsService.getProfessorsByDepartment(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener profesor por ID' })
  @ApiResponse({ status: 200, description: 'Profesor obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.professorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar profesor' })
  @ApiResponse({ status: 200, description: 'Profesor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateProfessorDto: UpdateProfessorDto,
    @Request() req: any,
  ) {
    return this.professorsService.updateProfessor(id, updateProfessorDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar profesor' })
  @ApiResponse({ status: 200, description: 'Profesor desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Profesor no encontrado' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.professorsService.deactivateProfessor(id, req.user.sub);
  }
}