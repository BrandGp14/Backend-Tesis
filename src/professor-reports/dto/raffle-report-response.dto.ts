import { ApiProperty } from '@nestjs/swagger';

export class RaffleStatisticsDto {
  @ApiProperty({
    description: 'Número total de rifas',
    example: 15
  })
  totalRaffles: number;

  @ApiProperty({
    description: 'Número de rifas activas',
    example: 5
  })
  activeRaffles: number;

  @ApiProperty({
    description: 'Número de rifas completadas',
    example: 8
  })
  completedRaffles: number;

  @ApiProperty({
    description: 'Número de rifas canceladas',
    example: 2
  })
  cancelledRaffles: number;

  @ApiProperty({
    description: 'Ingresos totales generados',
    example: 15750.50
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Número total de tickets vendidos',
    example: 1250
  })
  totalTicketsSold: number;

  @ApiProperty({
    description: 'Número total de tickets disponibles',
    example: 2000
  })
  totalTicketsAvailable: number;

  @ApiProperty({
    description: 'Porcentaje de ocupación promedio',
    example: 62.5
  })
  averageOccupancyRate: number;
}

export class RaffleDetailDto {
  @ApiProperty({
    description: 'ID de la rifa',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  id: string;

  @ApiProperty({
    description: 'Título de la rifa',
    example: 'Rifa Benefica Estudiantil'
  })
  title: string;

  @ApiProperty({
    description: 'Estado de la rifa',
    example: 'ACTIVE'
  })
  status: string;

  @ApiProperty({
    description: 'Tickets vendidos',
    example: 85
  })
  ticketsSold: number;

  @ApiProperty({
    description: 'Tickets disponibles',
    example: 100
  })
  ticketsAvailable: number;

  @ApiProperty({
    description: 'Ingresos generados',
    example: 850.00
  })
  revenue: number;

  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2024-01-15T00:00:00.000Z'
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin',
    example: '2024-02-15T00:00:00.000Z'
  })
  endDate: Date;

  @ApiProperty({
    description: 'Organizador de la rifa',
    example: 'Juan Pérez'
  })
  organizer: string;

  @ApiProperty({
    description: 'Departamento',
    example: 'Ingeniería de Sistemas'
  })
  department: string;
}

export class RaffleReportResponseDto {
  @ApiProperty({
    description: 'Estadísticas generales de rifas',
    type: RaffleStatisticsDto
  })
  statistics: RaffleStatisticsDto;

  @ApiProperty({
    description: 'Detalles de rifas individuales',
    type: [RaffleDetailDto]
  })
  raffleDetails: RaffleDetailDto[];

  @ApiProperty({
    description: 'Fecha de generación del reporte',
    example: '2024-01-01T12:00:00.000Z'
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Período del reporte (desde)',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  reportPeriodStart?: Date;

  @ApiProperty({
    description: 'Período del reporte (hasta)',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  reportPeriodEnd?: Date;
}