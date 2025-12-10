import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsOptional, IsDateString, IsBoolean, IsString } from 'class-validator';

export class StudentRaffleReportRequestDto {
  @ApiProperty({
    description: 'Fecha de inicio del reporte',
    example: '2025-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin del reporte',
    example: '2025-12-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'IDs específicos de usuarios para incluir en el reporte',
    example: ['user1-uuid', 'user2-uuid'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds?: string[];

  @ApiProperty({
    description: 'Si incluir estadísticas detalladas',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeStatistics?: boolean = true;

  @ApiProperty({
    description: 'Si incluir solo rifas activas',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  activeRafflesOnly?: boolean = false;

  @ApiProperty({
    description: 'Filtro por estado específico de rifas',
    example: 'STARTED',
    required: false
  })
  @IsOptional()
  @IsString()
  raffleStatus?: string;
}

export class UserRaffleDetailDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  userId: string;

  @ApiProperty({
    description: 'Información del usuario',
    example: {
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@estudiante.edu'
    }
  })
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Total de rifas gestionadas',
    example: 5
  })
  totalRaffles: number;

  @ApiProperty({
    description: 'Total de tickets vendidos',
    example: 125
  })
  totalTicketsSold: number;

  @ApiProperty({
    description: 'Ingresos totales generados',
    example: 2500.50
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Rifas activas actualmente',
    example: 2
  })
  activeRaffles: number;

  @ApiProperty({
    description: 'Rifas completadas',
    example: 3
  })
  completedRaffles: number;

  @ApiProperty({
    description: 'Promedio de ocupación de rifas',
    example: 85.5
  })
  averageOccupancyRate: number;

  @ApiProperty({
    description: 'Detalles de rifas individuales',
    example: [
      {
        id: 'raffle-uuid-1',
        title: 'Rifa Benéfica Navidad',
        status: 'STARTED',
        ticketsSold: 45,
        ticketsAvailable: 100,
        revenue: 450.00,
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2025-12-25T23:59:59.000Z'
      }
    ],
    type: [Object]
  })
  raffleDetails: {
    id: string;
    title: string;
    status: string;
    ticketsSold: number;
    ticketsAvailable: number;
    revenue: number;
    startDate: Date;
    endDate: Date;
    occupancyRate: number;
  }[];
}

export class StudentRaffleReportResponseDto {
  @ApiProperty({
    description: 'Estadísticas generales del reporte',
    example: {
      totalUsers: 15,
      totalRaffles: 45,
      totalRevenue: 12500.75,
      totalTicketsSold: 850,
      averageRafflesPerUser: 3,
      averageRevenuePerUser: 833.38
    }
  })
  generalStatistics: {
    totalUsers: number;
    totalRaffles: number;
    totalRevenue: number;
    totalTicketsSold: number;
    averageRafflesPerUser: number;
    averageRevenuePerUser: number;
    totalTicketsAvailable: number;
    overallOccupancyRate: number;
  };

  @ApiProperty({
    description: 'Detalles por usuario',
    type: [UserRaffleDetailDto]
  })
  userDetails: UserRaffleDetailDto[];

  @ApiProperty({
    description: 'Información del profesor que genera el reporte',
    example: {
      id: 'professor-uuid',
      name: 'Dr. María González',
      email: 'maria.gonzalez@universidad.edu',
      department: 'Ingeniería de Sistemas'
    }
  })
  professorInfo: {
    id: string;
    name: string;
    email: string;
    department: string;
  };

  @ApiProperty({
    description: 'Fecha de generación del reporte',
    example: '2025-12-09T10:30:00.000Z'
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Inicio del período del reporte',
    example: '2025-01-01T00:00:00.000Z'
  })
  reportPeriodStart?: Date;

  @ApiProperty({
    description: 'Fin del período del reporte',
    example: '2025-12-31T23:59:59.000Z'
  })
  reportPeriodEnd?: Date;

  @ApiProperty({
    description: 'Total de usuarios incluidos en el reporte',
    example: 15
  })
  totalUsers: number;
}

export class EmailReportRequestDto {
  @ApiProperty({
    description: 'Datos del reporte a enviar',
    example: {
      generalStatistics: { totalUsers: 15, totalRaffles: 45 },
      userDetails: [],
      professorInfo: { name: 'Dr. María González' }
    }
  })
  reportData: StudentRaffleReportResponseDto;

  @ApiProperty({
    description: 'ID del organizador destinatario',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  organizerId: string;

  @ApiProperty({
    description: 'Tipo de reporte',
    example: 'MONTHLY',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM', 'URGENT']
  })
  @IsString()
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM' | 'URGENT';

  @ApiProperty({
    description: 'Asunto personalizado del email',
    example: 'Reporte Mensual de Rifas - Diciembre 2025',
    required: false
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Mensaje adicional del profesor',
    example: 'Este mes hemos visto un incremento significativo en la participación estudiantil.',
    required: false
  })
  @IsOptional()
  @IsString()
  additionalMessage?: string;

  @ApiProperty({
    description: 'Si adjuntar PDF del reporte',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  attachPDF?: boolean = true;
}