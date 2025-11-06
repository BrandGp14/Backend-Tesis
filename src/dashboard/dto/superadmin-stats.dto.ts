import { ApiProperty } from '@nestjs/swagger';

export class SuperAdminStatsDto {
  @ApiProperty({ 
    example: 5, 
    description: 'Total de instituciones en el sistema' 
  })
  totalInstitutions: number;

  @ApiProperty({ 
    example: 4, 
    description: 'Instituciones activas (habilitadas)' 
  })
  activeInstitutions: number;

  @ApiProperty({ 
    example: 8, 
    description: 'Total de administradores (ADMIN + ADMINSUPREMO)' 
  })
  totalAdmins: number;

  @ApiProperty({ 
    example: 150, 
    description: 'Total de usuarios en el sistema' 
  })
  totalUsers: number;

  @ApiProperty({ 
    example: 12, 
    description: 'Porcentaje de crecimiento de usuarios en el último mes' 
  })
  growthPercentage: number;
}