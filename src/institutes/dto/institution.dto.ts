import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { InstitutionDepartmentDto } from './institution-department.dto';
import { InstituteConfigurationDto } from './institution-configuration.dto';

export class InstitutionDto {

  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  document_number: string;

  @IsString()
  @IsNotEmpty()
  document_type: string;

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

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  enabled: boolean = true;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstitutionDepartmentDto)
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        const institutionDepartments = JSON.parse(value);
        return plainToInstance(InstitutionDepartmentDto, institutionDepartments);
      }
    }
  )
  departments: InstitutionDepartmentDto[] = [];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InstitutionDepartmentDto)
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        const institutionDepartments = JSON.parse(value);
        return plainToInstance(InstituteConfigurationDto, institutionDepartments);
      }
    }
  )
  configurations: InstituteConfigurationDto[] = [];
}
