import { ApiProperty } from '@nestjs/swagger';

export class AdminRoleDto {
  @ApiProperty({ 
    example: 'ADMIN',
    description: 'Descripción del rol' 
  })
  roleDescription: string;

  @ApiProperty({ 
    example: 'TECSUP',
    description: 'Descripción de la institución' 
  })
  institutionDescription: string;
}

export class AdminUserDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del usuario' 
  })
  id: string;

  @ApiProperty({ 
    example: 'admin@tecsup.edu.pe',
    description: 'Email del administrador' 
  })
  email: string;

  @ApiProperty({ 
    example: 'Juan',
    description: 'Nombres del administrador' 
  })
  firstName: string;

  @ApiProperty({ 
    example: 'Pérez',
    description: 'Apellidos del administrador' 
  })
  lastName: string;

  @ApiProperty({ 
    example: 'Juan Pérez',
    description: 'Nombre completo del administrador' 
  })
  name: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la institución principal' 
  })
  institutionId: string;

  @ApiProperty({ 
    example: 'TECSUP',
    description: 'Nombre de la institución principal' 
  })
  institutionName: string;

  @ApiProperty({ 
    type: [AdminRoleDto],
    description: 'Roles del administrador' 
  })
  roles: AdminRoleDto[];

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación' 
  })
  createdAt: string;
}

export class AdminsListResponseDto {
  @ApiProperty({ 
    type: [AdminUserDto],
    description: 'Lista de administradores del sistema' 
  })
  data: AdminUserDto[];
}