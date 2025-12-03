import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRoleDto } from './user-role.dto';
import { InstitutionDto } from 'src/institutes/dto/institution.dto';

export class UserDto {

  @IsOptional()
  @IsString()
  id: string

  @ApiProperty({ example: 'test@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  student_code?: string;

  @IsString()
  @IsOptional()
  document_number: string;

  @IsString()
  @IsOptional()
  document_type: string;

  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({ example: 'https://www.picture.com/pic.jpg' })
  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  last_login: Date;

  @IsBoolean()
  @IsOptional()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Institución del usuario' })
  @Type(() => InstitutionDto)
  institution: InstitutionDto;

  @ApiPropertyOptional({ description: 'Roles del usuario por institución' })
  @IsArray()
  @IsOptional()
  @Type(() => UserRoleDto)
  roles: UserRoleDto[] = [];

  @IsArray()
  @IsOptional()
  @Type(() => UserDto)
  assigned: UserDto[] = [];
}
