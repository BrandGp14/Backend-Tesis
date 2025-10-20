import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PageReference } from 'src/common/enum/page.reference';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';

@Controller('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthService)
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get('/search')
  @ApiOperation({ summary: 'Lista paginada de roles' })
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
    @Query('enabled') enabled?: boolean,
  ) {
    const roles = await this.rolesService.search(page, size, enabled);

    return ApiResponse.success(roles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  async find(@Param('id') id: string) {
    const role = await this.rolesService.find(id);
    if (!role) return ApiResponse.notFound('Role not found');
    return ApiResponse.success(role);
  }

  @Post()
  @ApiOperation({ summary: 'Crear rol' })
  async create(@Body() createRoleDto: RoleDto, @Req() req: { user: JwtDto }) {
    const role = await this.rolesService.create(createRoleDto, req.user);
    return ApiResponse.success(role);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar rol por ID' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() req: { user: JwtDto }) {
    const role = await this.rolesService.update(id, updateRoleDto, req.user);
    if (!role) return ApiResponse.notFound('Role not found');
    return ApiResponse.success(role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol por ID' })
  async delete(@Param('id') id: string, @Req() req: { user: JwtDto }) {
    const role = await this.rolesService.delete(id, req.user);
    if (!role) return ApiResponse.notFound('Role not found');
    return ApiResponse.deleted();
  }
}
