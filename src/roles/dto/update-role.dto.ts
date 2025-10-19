import { PartialType } from '@nestjs/mapped-types';
import { RoleDto } from './role.dto';

export class UpdateRoleDto extends PartialType(RoleDto) {}
