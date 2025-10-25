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
import { RaffleStatusReference } from '../type/raffle.status.reference';
import { RaffleImageDto } from './raffle-image.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { RaffleGiftImageDto } from './rafle-gift-image.dto';

export class RaffleDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @IsString()
  @IsNotEmpty()
  currencySymbol: string;

  @IsString()
  @IsNotEmpty()
  awardDescription: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  available: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  sold: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  assignedPerUser: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  allowExternalParticipants: boolean;

  @IsString()
  @IsOptional()
  winner: string;

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

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  enabled: boolean;

  @IsString()
  @IsNotEmpty()
  institution_id: string;

  @IsString()
  @IsNotEmpty()
  institutionDescription: string;

  @IsString()
  @IsNotEmpty()
  institution_department_id: string;

  @IsString()
  @IsNotEmpty()
  institutionDepartmentDescription: string;

  @IsString()
  @IsNotEmpty()
  organizer_id: string;

  @IsString()
  @IsNotEmpty()
  organizerDescription: string;

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
}
