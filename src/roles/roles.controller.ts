import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiResponse } from 'src/common/dto/api.response.dto';

@Controller('roles')
// @UseGuards(RolesGuard) // Protege todos los endpoints del controlador por rol
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  // @Roles('ADMIN', 'ADMINSUPREMO')
  async create(@Body() createRoleDto: RoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return ApiResponse.success(role);
  }

  @Get()
  @Roles('ADMIN', 'ADMINSUPREMO')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'ADMINSUPREMO')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'ADMINSUPREMO')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ADMINSUPREMO')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
