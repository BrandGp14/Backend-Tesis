import { IsString, IsNotEmpty, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromoteUserToAdminDto {
  @ApiProperty({ 
    example: 'usuario@tecsup.edu.pe',
    description: 'Email del usuario existente que se promoverá a administrador' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la institución donde será administrador' 
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  institutionId: string;
}

export class CreateAdministratorResponseDto {
  @ApiProperty({ 
    example: true,
    description: 'Indica si la operación fue exitosa' 
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Datos del administrador creado',
    example: {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Pérez",
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