import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class InstitutionDto {

  @IsOptional()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  ruc: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUrl()
  @IsNotEmpty()
  website: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean = true;
}
