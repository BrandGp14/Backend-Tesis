import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInstitutionStatusDto {
  @ApiProperty({ 
    example: true,
    description: 'Estado activo/inactivo de la institución' 
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class InstitutionStatusResponseDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la institución' 
  })
  id: string;

  @ApiProperty({ 
    example: true,
    description: 'Nuevo estado de la institución' 
  })
  isActive: boolean;
}