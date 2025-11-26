import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { RaffleNumberStatus } from '../enums/raffle-number-status.enum';

export class RaffleNumberDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  number: number;

  @IsEnum(RaffleNumberStatus)
  @IsOptional()
  status?: RaffleNumberStatus;

  @IsString()
  @IsNotEmpty()
  raffle_id: string;

  @IsString()
  @IsOptional()
  reserved_by?: string;

  @IsDateString()
  @IsOptional()
  reservation_expires?: Date;

  @IsString()
  @IsOptional()
  ticket_id?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class ReserveNumbersDto {
  @IsString()
  @IsNotEmpty()
  raffle_id: string;

  @IsNumber({}, { each: true })
  @IsNotEmpty()
  numbers: number[];

  @IsString()
  @IsOptional()
  user_id?: string;
}

export class RaffleNumbersAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  raffle_id: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  total_numbers: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  available_count: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  reserved_count: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  sold_count: number;

  numbers: RaffleNumberDto[];
}

export class ReserveTicketsDto {
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  selectedNumbers: number[];

  @IsString()
  @IsNotEmpty()
  userId: string;
}