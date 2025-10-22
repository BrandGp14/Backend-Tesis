import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InstitutionDepartmentDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsOptional()
    department_id: string;

    @IsString()
    @IsNotEmpty()
    departmentCode: string;

    @IsString()
    @IsNotEmpty()
    departmentDescription: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    enabled: boolean;
}