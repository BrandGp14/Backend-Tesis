import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminsListResponseDto } from './dto/admin-response.dto';
import { AdministratorsDashboardDto } from './dto/administrators-dashboard.dto';
import { AdministratorsQueryDto } from './dto/administrators-query.dto';
import { PromoteUserToAdminDto, CreateAdministratorResponseDto } from './dto/create-administrator.dto';
import { ChangeUserRoleDto, ChangeUserRoleResponseDto } from './dto/change-user-role.dto';
import { RegisterAdminDto, RegisterAdminResponseDto } from './dto/register-admin.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthService, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Lista paginada de usuarios' })
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
    @Query('enabled') enabled?: boolean,
  ) {
    const users = await this.usersService.search(page, size, enabled);

    return ApiResponse.success(users);
  }

  @Get('admins')
  @Roles('ADMINSUPREMO')
  @ApiOperation({ 
    summary: 'Obtiene lista de administradores del sistema',
    description: 'Endpoint exclusivo para ADMINSUPREMO. Retorna usuarios con roles ADMIN y ADMINSUPREMO' 
  })
  async getAdmins() {
    try {
      const admins = await this.usersService.getAdminUsers();
      return ApiResponse.success(admins);
    } catch (error) {
      return ApiResponse.error(error.message, 500);
    }
  }

  @Get('administrators')
  @Roles('ADMINSUPREMO')
  @ApiOperation({ 
    summary: 'Obtiene dashboard de administradores e instituciones',
    description: 'Endpoint exclusivo para ADMINSUPREMO. Retorna administradores e instituciones para el dashboard' 
  })
  async getAdministratorsDashboard(@Query() query: AdministratorsQueryDto) {
    try {
      const dashboard = await this.usersService.getAdministratorsDashboard(query);
      return ApiResponse.success(dashboard);
    } catch (error) {
      return ApiResponse.error(error.message, 500);
    }
  }


  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.find(id);
    if (!user) return ApiResponse.notFound('User not found');
    return ApiResponse.success(user);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  async create(@Body() createUserDto: UserDto, @Req() req: { user: JwtDto }) {
    const user = await this.usersService.create(createUserDto, req.user);
    return ApiResponse.success(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: { user: JwtDto }) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Put(':id/profile')
  @ApiOperation({ summary: 'Actualizar perfil de estudiante' })
  async updateProfile(
    @Param('id') id: string, 
    @Body() updateProfileDto: UpdateProfileDto, 
    @Req() req: { user: JwtDto }
  ) {
    // Validar que el usuario solo pueda editar su propio perfil
    if (id !== req.user.sub) {
      return ApiResponse.error('No tienes permisos para editar este perfil', 403);
    }

    const user = await this.usersService.update(id, updateProfileDto, req.user);
    return ApiResponse.success(user);
  }
}