import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez García' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+57312456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '202012345' })
  @IsString()
  @IsOptional()
  student_code?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsString()
  @IsOptional()
  document_number?: string;

  @ApiPropertyOptional({ 
    example: 'DNI',
    enum: ['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE'],
    description: 'Tipo de documento de identidad'
  })
  @IsString()
  @IsIn(['DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE'])
  @IsOptional()
  document_type?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ 
    example: 'https://srv-file7.gofile.io/download/abc123/image.jpg',
    description: 'URL de la foto de perfil'
  })
  @IsString()
  @IsOptional()
  picture?: string;
}