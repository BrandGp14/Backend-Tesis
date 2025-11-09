import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOrganizadorDto {
  @ApiProperty({
    description: 'Email del organizador (debe pertenecer al dominio tecsup.edu.pe)',
    example: 'carlos.mendez@tecsup.edu.pe'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre del organizador',
    example: 'Carlos Alberto'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellidos del organizador',
    example: 'Mendez Rodriguez'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '12345678'
  })
  @IsString()
  @IsNotEmpty()
  document_number: string;

  @ApiProperty({
    description: 'Tipo de documento',
    example: 'DNI',
    enum: ['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE']
  })
  @IsString()
  @IsNotEmpty()
  document_type: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+51987654321'
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Contraseña temporal (mínimo 8 caracteres)',
    example: 'TempPassword123!'
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'ID del departamento al que será asignado',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'Código de estudiante (opcional para organizadores)',
    example: 'ORG2024001',
    required: false
  })
  @IsString()
  @IsOptional()
  student_code?: string;
}

export class RegisterOrganizadorResponseDto {
  @ApiProperty({
    description: 'ID del usuario creado',
    example: '550e8400-e29b-41d4-a716-446655440100'
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo del organizador',
    example: 'Carlos Alberto Mendez Rodriguez'
  })
  name: string;

  @ApiProperty({
    description: 'Email del organizador',
    example: 'carlos.mendez@tecsup.edu.pe'
  })
  email: string;

  @ApiProperty({
    description: 'Rol asignado',
    example: 'ORGANIZADOR'
  })
  role: string;

  @ApiProperty({
    description: 'ID de la institución TECSUP',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  institutionId: string;

  @ApiProperty({
    description: 'ID del departamento asignado',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  departmentId: string;

  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Tecnología Digital'
  })
  departmentName: string;

  @ApiProperty({
    description: 'Fecha de registro',
    example: '2024-01-15T10:30:00Z'
  })
  registrationDate: string;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true
  })
  isActive: boolean;
}