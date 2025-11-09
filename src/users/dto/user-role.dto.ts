import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UserRoleDto {

    @IsString()
    @IsOptional()
    id: string

    @IsString()
    user_id: string

    @IsString()
    @IsOptional()
    userDescription: string

    @IsString()
    role_id: string

    @IsString()
    @IsOptional()
    roleDescription: string

    @IsString()
    institution_id: string

    @IsString()
    @IsOptional()
    institutionDescription: string

    @IsString()
    @IsOptional()
    department_id?: string

    @IsString()
    @IsOptional()
    departmentDescription?: string

    @IsBoolean()
    @IsOptional()
    enabled: boolean
}