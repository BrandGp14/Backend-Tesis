import { PartialType } from '@nestjs/mapped-types';
import { RolePermissionDto } from './role-permission.dto';

export class UpdateRolePermissionDto extends PartialType(RolePermissionDto) {}