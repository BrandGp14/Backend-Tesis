import { IsString, IsNotEmpty, MinLength, IsEmail, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({ 
    example: 'admin@wasirifa.digital',
    description: 'Email del administrador supremo (debe ser @wasirifa.digital)' 
  })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/@wasirifa\.digital$/, {
    message: 'El email debe terminar en @wasirifa.digital para administradores supremos'
  })
  email: string;

  @ApiProperty({ 
    example: 'Carlos Alberto',
    description: 'Nombres del administrador' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ 
    example: 'Rodríguez Mendoza',
    description: 'Apellidos del administrador' 
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
    example: 'AdminPassword123!',
    description: 'Contraseña (mínimo 10 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo)' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'password debe tener al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial'
  })
  password: string;

  @ApiProperty({
    example: 'SECRET_ADMIN_KEY_2024',
    description: 'Clave secreta para registro de administrador supremo'
  })
  @IsString()
  @IsNotEmpty()
  adminSecretKey: string;
}