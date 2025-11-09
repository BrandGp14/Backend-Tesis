import { IsOptional, IsBoolean, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRaffleDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 12, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  size?: number = 12;

  @ApiPropertyOptional({ description: 'Filter by enabled status', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Institution ID filter' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ description: 'Search term for raffle title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO date string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Organizer ID filter' })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional({ description: 'Department ID filter' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Sort by popularity', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  popularity?: boolean;
}