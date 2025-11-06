import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InstitutionsQueryDto {
  @ApiPropertyOptional({ 
    example: 'TECSUP',
    description: 'Buscar por nombre o dominio de institución'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    example: 10,
    description: 'Número máximo de resultados por página',
    minimum: 1,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    example: 1,
    description: 'Número de página',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 'active',
    description: 'Estado de las instituciones',
    enum: ['active', 'inactive', 'all'],
    default: 'all'
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'all'])
  status?: 'active' | 'inactive' | 'all' = 'all';
}