import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstitutionDto {
  @ApiProperty({ 
    example: 'TECSUP',
    description: 'Nombre de la institución' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ 
    example: 'tecsup.edu.pe',
    description: 'Dominio de email institucional (sin @)' 
  })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ 
    example: 'contacto@tecsup.edu.pe',
    description: 'Email de contacto institucional' 
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({ 
    example: '+51 1 317-3900',
    description: 'Teléfono de contacto' 
  })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({ 
    example: 'Av. Cascanueces 2221, Santa Anita 15008, Lima',
    description: 'Dirección física de la institución' 
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ 
    example: 'https://example.com/logo.png',
    description: 'URL del logo de la institución' 
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}