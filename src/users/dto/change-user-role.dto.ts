import { IsString, IsNotEmpty, IsEmail, IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserRoleDto {
  @ApiProperty({ 
    example: 'usuario@tecsup.edu.pe',
    description: 'Email del usuario al que se le cambiará el rol' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la institución donde se cambiará el rol' 
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  institutionId: string;

  @ApiProperty({ 
    example: 'ESTUDIANTE',
    description: 'Nuevo rol a asignar',
    enum: ['ESTUDIANTE', 'ORGANIZADOR', 'ADMIN']
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ESTUDIANTE', 'ORGANIZADOR', 'ADMIN'])
  newRole: string;
}

export class ChangeUserRoleResponseDto {
  @ApiProperty({ 
    example: true,
    description: 'Indica si la operación fue exitosa' 
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Datos del usuario con el rol actualizado',
    example: {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Pérez",
      "email": "usuario@tecsup.edu.pe",
      "previousRole": "ADMIN",
      "newRole": "ESTUDIANTE",
      "institutionId": "inst-uuid-123",
      "changedBy": "admin@tecsup.edu.pe",
      "changedAt": "2024-01-01T00:00:00.000Z"
    }
  })
  user: {
    id: string;
    name: string;
    email: string;
    previousRole: string;
    newRole: string;
    institutionId: string;
    changedBy: string;
    changedAt: string;
  };
}