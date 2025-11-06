import { ApiProperty } from '@nestjs/swagger';

export class AdministratorItemDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del administrador' 
  })
  id: string;

  @ApiProperty({ 
    example: 'Juan Pérez',
    description: 'Nombre completo del administrador' 
  })
  name: string;

  @ApiProperty({ 
    example: 'admin@tecsup.edu.pe',
    description: 'Email del administrador' 
  })
  email: string;

  @ApiProperty({ 
    example: 'ADMIN',
    description: 'Rol del administrador',
    enum: ['ADMIN', 'ADMINSUPREMO']
  })
  role: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la institución del administrador' 
  })
  institutionId: string;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de registro (ISO 8601)' 
  })
  registrationDate: string;

  @ApiProperty({ 
    example: true,
    description: 'Estado activo/inactivo del administrador' 
  })
  isActive: boolean;
}

export class InstitutionItemDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único de la institución' 
  })
  id: string;

  @ApiProperty({ 
    example: 'TECSUP',
    description: 'Nombre de la institución' 
  })
  name: string;

  @ApiProperty({ 
    example: 'tecsup.edu.pe',
    description: 'Dominio de email institucional' 
  })
  domain: string;

  @ApiProperty({ 
    example: '/logos/tecsup.png',
    description: 'URL del logo de la institución',
    nullable: true
  })
  logoUrl: string | null;

  @ApiProperty({ 
    example: 'contacto@tecsup.edu.pe',
    description: 'Email de contacto' 
  })
  contactEmail: string;

  @ApiProperty({ 
    example: '+51 1 317-3900',
    description: 'Teléfono de contacto' 
  })
  contactPhone: string;

  @ApiProperty({ 
    example: 'Av. Cascanueces 2221, Santa Anita 15008, Lima',
    description: 'Dirección física' 
  })
  address: string;

  @ApiProperty({ 
    example: true,
    description: 'Estado activo/inactivo de la institución' 
  })
  isActive: boolean;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación (ISO 8601)' 
  })
  createdAt: string;
}

export class PaginationMetaDto {
  @ApiProperty({ 
    example: 25,
    description: 'Total de registros' 
  })
  total: number;

  @ApiProperty({ 
    example: 1,
    description: 'Página actual' 
  })
  page: number;

  @ApiProperty({ 
    example: 10,
    description: 'Límite por página' 
  })
  limit: number;

  @ApiProperty({ 
    example: 3,
    description: 'Total de páginas' 
  })
  totalPages: number;
}

export class AdministratorsDashboardDto {
  @ApiProperty({ 
    type: [AdministratorItemDto],
    description: 'Lista paginada de administradores del sistema' 
  })
  administrators: AdministratorItemDto[];

  @ApiProperty({ 
    type: PaginationMetaDto,
    description: 'Información de paginación para administradores' 
  })
  administratorsPagination: PaginationMetaDto;

  @ApiProperty({ 
    type: [InstitutionItemDto],
    description: 'Lista paginada de instituciones del sistema' 
  })
  institutions: InstitutionItemDto[];

  @ApiProperty({ 
    type: PaginationMetaDto,
    description: 'Información de paginación para instituciones' 
  })
  institutionsPagination: PaginationMetaDto;
}