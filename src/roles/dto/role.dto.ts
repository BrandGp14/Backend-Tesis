import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { OneToMany } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { Type } from 'class-transformer';
import { PermissionDto } from './permission.dto';

export class RoleDto {

  @IsOptional()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  code: string;


  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean;

  @IsArray()
  @IsOptional()
  @Type(() => PermissionDto)
  @ValidateNested({ each: true })
  permissions: PermissionDto[];
}
