import { PartialType } from '@nestjs/mapped-types';
import { PermissionDto } from './permission.dto';

export class UpdatePermissionDto extends PartialType(PermissionDto) {}