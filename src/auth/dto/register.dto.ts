import { IsString, IsNotEmpty, MinLength, IsEmail, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'juan.perez@tecsup.edu.pe',
    description: 'Email institucional del usuario' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Juan Carlos',
    description: 'Nombres del usuario' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ 
    example: 'Pérez García',
    description: 'Apellidos del usuario' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ 
    example: '12345678',
    description: 'Número de documento de identidad (DNI, CE, etc.)' 
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9A-Z]{8,12}$/, {
    message: 'document_number debe tener entre 8-12 caracteres alfanuméricos'
  })
  document_number: string;

  @ApiProperty({ 
    example: 'DNI',
    description: 'Tipo de documento de identidad',
    enum: ['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE']
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(DNI|CARNET_EXTRANJERIA|PASAPORTE)$/, {
    message: 'document_type debe ser DNI, CARNET_EXTRANJERIA o PASAPORTE'
  })
  document_type: string;

  @ApiProperty({ 
    example: '+51987654321',
    description: 'Número de teléfono' 
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phone debe ser un número de teléfono válido'
  })
  phone: string;

  @ApiProperty({ 
    example: '202012345',
    description: 'Código de estudiante (opcional)',
    required: false
  })
  @IsString()
  @IsOptional()
  student_code?: string;

  @ApiProperty({ 
    example: 'MiPassword123!',
    description: 'Contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número)' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'password debe tener al menos 1 mayúscula, 1 minúscula y 1 número'
  })
  password: string;
}