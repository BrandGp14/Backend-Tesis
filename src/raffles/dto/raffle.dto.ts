import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RaffleStatusReference } from '../type/raffle.status.reference';
import { RaffleImageDto } from './raffle-image.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { RaffleGiftImageDto } from './rafle-gift-image.dto';
import { TicketDto } from './ticket.dto';
import { RaffleNumberDto } from './raffle-number.dto';

export class RaffleDto {
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty({ 
    example: "Rifa Tech Digital - Mega Sorteo",
    description: "Título de la rifa"
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: "Participa en nuestra rifa del Departamento de Tecnología Digital y gana increíbles premios tecnológicos: 1er Premio - Laptop Gaming ASUS ROG, 2do Premio - iPhone 15 Pro, 3er Premio - Auriculares Gaming Profesional.",
    description: "Descripción detallada de la rifa"
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ 
    example: "PEN",
    description: "Código de moneda ISO"
  })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({ 
    example: "S/.",
    description: "Símbolo de la moneda"
  })
  @IsString()
  @IsNotEmpty()
  currencySymbol: string;

  @ApiProperty({ 
    example: "1er Premio: Laptop Gaming ASUS ROG | 2do Premio: iPhone 15 Pro | 3er Premio: Auriculares Gaming HyperX",
    description: "Descripción de los premios"
  })
  @IsString()
  @IsNotEmpty()
  awardDescription: string;

  @ApiProperty({ 
    example: 15.0,
    description: "Precio por número"
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @ApiProperty({ 
    example: 1000,
    description: "Cantidad total de números disponibles (se generarán automáticamente del 1 al valor especificado)"
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  available: number;

  @ApiProperty({ 
    example: 0,
    description: "Números vendidos actualmente"
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  sold: number;

  @ApiProperty({ 
    example: 10,
    description: "Máximo números por usuario"
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  assignedPerUser: number;

  @ApiProperty({ 
    example: "2025-11-09T07:17:04.974Z",
    description: "Fecha de inicio de la rifa"
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ 
    example: "2025-12-08T07:17:04.974Z",
    description: "Fecha de fin de la rifa"
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ 
    example: true,
    description: "Permitir participantes externos"
  })
  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  allowExternalParticipants: boolean;

  @ApiProperty({ 
    example: null,
    description: "Ganador de la rifa (opcional)"
  })
  @IsString()
  @IsOptional()
  winner: string | null;

  @ApiProperty({ 
    example: "2025-12-10T07:17:04.974Z",
    description: "Fecha del sorteo"
  })
  @IsDateString()
  @IsNotEmpty()
  drawDate: Date;

  @IsEnum(RaffleStatusReference)
  @IsOptional()
  @Transform(
    ({ value }) => {
      if (typeof value !== 'string' && !RaffleStatusReference[value as keyof typeof RaffleStatusReference]) throw new Error('Invalid RaffleStatusReference');
      return RaffleStatusReference[value as keyof typeof RaffleStatusReference];
    },
    { toClassOnly: true }
  )
  status?: RaffleStatusReference | keyof typeof RaffleStatusReference;

  @ApiProperty({ 
    example: true,
    description: "Estado habilitado de la rifa"
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  enabled: boolean;

  @ApiProperty({ 
    example: "4aada215-5828-4c0c-8885-16046e3be619",
    description: "ID de la institución"
  })
  @IsString()
  @IsNotEmpty()
  institution_id: string;

  @ApiProperty({ 
    example: "Universidad Tecnológica",
    description: "Descripción de la institución"
  })
  @IsString()
  @IsNotEmpty()
  institutionDescription: string;

  @ApiProperty({ 
    example: "a610d0cf-e519-4563-a4c7-1083f2724374",
    description: "ID del departamento de la institución"
  })
  @IsString()
  @IsNotEmpty()
  institution_department_id: string;

  @ApiProperty({ 
    example: "Departamento de Tecnología Digital",
    description: "Descripción del departamento"
  })
  @IsString()
  @IsNotEmpty()
  institutionDepartmentDescription: string;

  @ApiProperty({ 
    example: "79d0df85-9705-46ab-bd0a-74959f806b2c",
    description: "ID del usuario organizador"
  })
  @IsString()
  @IsNotEmpty()
  organizer_id: string;

  @ApiProperty({ 
    example: "Coordinador de Tecnología",
    description: "Descripción del organizador"
  })
  @IsString()
  @IsNotEmpty()
  organizerDescription: string;

  @ApiProperty({ 
    example: [
      {
        "imageUrl": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
        "displayOrder": 1,
        "enabled": true
      },
      {
        "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
        "displayOrder": 2,
        "enabled": true
      }
    ],
    description: "Imágenes promocionales de la rifa",
    type: [RaffleImageDto]
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RaffleImageDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const raffleImages = JSON.parse(value);
      return plainToInstance(RaffleImageDto, raffleImages);
    }
    return value;
  })
  raffleImages: RaffleImageDto[] = [];

  @ApiProperty({ 
    example: [
      {
        "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        "enabled": true
      }
    ],
    description: "Imágenes de los premios de la rifa",
    type: [RaffleGiftImageDto]
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RaffleGiftImageDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const raffleGiftImages = JSON.parse(value);
      return plainToInstance(RaffleGiftImageDto, raffleGiftImages);
    }
    return value;
  })
  raffleGiftImages: RaffleGiftImageDto[] = [];

  @IsArray()
  @IsOptional()
  tickets: TicketDto[] = [];

  @IsArray()
  @IsOptional()
  raffleNumbers: RaffleNumberDto[] = [];
}
