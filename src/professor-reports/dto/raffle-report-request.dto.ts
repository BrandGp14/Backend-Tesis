import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class RaffleReportRequestDto {
  @ApiProperty({
    description: 'ID del organizador para filtrar rifas',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    required: false
  })
  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @ApiProperty({
    description: 'ID del departamento institucional para filtrar rifas',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    required: false
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({
    description: 'Fecha de inicio para filtrar rifas',
    example: '2024-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar rifas',
    example: '2024-12-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}