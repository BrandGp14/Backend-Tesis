import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AvailableUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'juan.perez@tecsup.edu.pe' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ example: 'USER' })
  currentRole: string;

  @ApiProperty({ example: 'estudiante_12345', required: false })
  studentCode?: string;

  @ApiProperty({ example: 'TECSUP' })
  institutionName?: string;

  @ApiProperty({ example: 'Tecnología Digital', required: false })
  departmentName?: string;
}

export class AvailableUsersResponseDto {
  @ApiProperty({ type: [AvailableUserDto] })
  users: AvailableUserDto[];

  @ApiProperty({ example: 25 })
  total: number;
}
