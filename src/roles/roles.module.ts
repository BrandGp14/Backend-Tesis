import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { RolePermissionService } from './role-permission.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { RolePermissionController } from './role-permission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [RolesService, PermissionsService, RolePermissionService],
  controllers: [RolesController, PermissionsController, RolePermissionController],
  exports: [RolesService, PermissionsService, RolePermissionService, TypeOrmModule],
})
export class RolesModule {}
