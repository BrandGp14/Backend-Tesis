import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateRaffleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  prize: string;

  @IsOptional()
  @IsNumber()
  prizeValue?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  drawDate?: string;

  @IsOptional()
  @IsString()
  streamUrl?: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  organizerId: string;

  @IsOptional()
  @IsNumber()
  maxTickets?: number;

  @IsOptional()
  @IsString()
  flyerUrl?: string;
}