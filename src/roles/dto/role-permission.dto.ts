import { IsOptional, IsString } from 'class-validator';

export class RolePermissionDto {
  @IsString()
  role_id: string;

  @IsString()
  @IsOptional()
  role_code: string;

  @IsString()
  @IsOptional()
  roleDescription: string;

  @IsString()
  permission_id: string;

  @IsString()
  @IsOptional()
  permission_code: string;

  @IsString()
  @IsOptional()
  permissionDescription: string;
}