import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProfessorDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  departmentId: string;

  @IsString()
  specialization: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  academicTitle?: string;
}

export class AssignOrganizerDto {
  @IsUUID()
  professorId: string;

  @IsUUID()
  organizerRoleId: string;
}

export class UpdateProfessorDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  academicTitle?: string;

  @IsOptional()
  isActive?: boolean;
}