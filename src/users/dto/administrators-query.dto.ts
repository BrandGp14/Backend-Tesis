import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdministratorsQueryDto {
  @ApiPropertyOptional({ 
    example: 1,
    description: 'Número de página para administradores',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  adminPage?: number = 1;

  @ApiPropertyOptional({ 
    example: 10,
    description: 'Número máximo de administradores por página',
    minimum: 1,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  adminLimit?: number = 10;

  @ApiPropertyOptional({ 
    example: 1,
    description: 'Número de página para instituciones',
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  institutionPage?: number = 1;

  @ApiPropertyOptional({ 
    example: 10,
    description: 'Número máximo de instituciones por página',
    minimum: 1,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  institutionLimit?: number = 10;
}