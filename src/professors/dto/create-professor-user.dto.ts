import { IsEmail, IsString, IsUUID, IsOptional, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfessorUserDto {
  @ApiProperty({
    description: 'Email del profesor (debe ser único en el sistema)',
    example: 'profesor.sistemas@tecsup.edu.pe',
    format: 'email'
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña para el usuario profesor',
    example: 'ProfesorSeguro123!',
    minLength: 8
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({
    description: 'Nombre del profesor',
    example: 'Dr. Juan Carlos'
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Apellidos del profesor',
    example: 'Pérez Mendoza'
  })
  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  lastName: string;

  @ApiProperty({
    description: 'ID de la institución a la que pertenece el profesor',
    example: '11111111-1111-1111-1111-111111111111',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'Debe ser un UUID válido para la institución' })
  @IsNotEmpty({ message: 'El ID de institución es requerido' })
  institutionId: string;

  @ApiProperty({
    description: 'ID del departamento al que pertenece el profesor',
    example: '22222222-2222-2222-2222-222222222222',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'Debe ser un UUID válido para el departamento' })
  @IsNotEmpty({ message: 'El ID de departamento es requerido' })
  departmentId: string;

  @ApiProperty({
    description: 'Especialización o área de expertise del profesor',
    example: 'Ingeniería de Sistemas y Tecnologías Educativas',
    required: false
  })
  @IsString({ message: 'La especialización debe ser una cadena de texto' })
  @IsOptional()
  specialization?: string;

  @ApiProperty({
    description: 'Número de teléfono del profesor',
    example: '+51 987654321',
    required: false
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'DNI del profesor',
    example: '12345678',
    required: false
  })
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsOptional()
  dni?: string;
}