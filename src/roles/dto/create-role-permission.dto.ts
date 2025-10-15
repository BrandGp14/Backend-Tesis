import { IsNumber } from 'class-validator';

export class CreateRolePermissionDto {
  @IsNumber()
  role_id: number;

  @IsNumber()
  permission_id: number;
}