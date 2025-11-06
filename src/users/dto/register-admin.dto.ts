import { IsString, IsNotEmpty, IsEmail, IsUUID, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({ 
    example: 'Juan Carlos',
    description: 'Nombres del administrador' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ 
    example: 'Pérez López',
    description: 'Apellidos del administrador' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ 
    example: 'admin@tecsup.edu.pe',
    description: 'Email del administrador (debe coincidir con el dominio de la institución)' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: '12345678',
    description: 'Número de documento de identidad' 
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
  @Matches(/^\\+?[1-9]\\d{1,14}$/, {
    message: 'phone debe ser un número de teléfono válido'
  })
  phone: string;

  @ApiProperty({ 
    example: 'AdminPassword123!',
    description: 'Contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número)' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]/, {
    message: 'password debe tener al menos 1 mayúscula, 1 minúscula y 1 número'
  })
  password: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la institución donde será administrador' 
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  institutionId: string;
}

export class RegisterAdminResponseDto {
  @ApiProperty({ 
    example: true,
    description: 'Indica si la operación fue exitosa' 
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Datos del administrador registrado',
    example: {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Carlos Pérez López",
      "email": "admin@tecsup.edu.pe",
      "role": "ADMIN",
      "institutionId": "inst-uuid-123",
      "registrationDate": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  })
  administrator: {
    id: string;
    name: string;
    email: string;
    role: string;
    institutionId: string;
    registrationDate: string;
    isActive: boolean;
  };
}