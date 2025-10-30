import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';

@Module({
  imports: [EntitiesModuleModule],
  providers: [RolesService, PermissionsService],
  controllers: [RolesController, PermissionsController],
  exports: [RolesService, PermissionsService],
})
export class RolesModule { }
