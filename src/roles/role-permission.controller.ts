import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';

@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  create(@Body() dto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolePermissionService.findAll();
  }

  @Get('by-role/:role_id')
  findByRole(@Param('role_id') role_id: number) {
    return this.rolePermissionService.findByRole(role_id);
  }

  @Get('by-permission/:permission_id')
  findByPermission(@Param('permission_id') permission_id: number) {
    return this.rolePermissionService.findByPermission(permission_id);
  }

  @Delete(':role_id/:permission_id')
  remove(@Param('role_id') role_id: number, @Param('permission_id') permission_id: number) {
    return this.rolePermissionService.remove(role_id, permission_id);
  }
}