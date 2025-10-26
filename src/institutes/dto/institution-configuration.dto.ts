import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InstituteConfigurationDto {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    value: string;

    @IsBoolean()
    @IsNotEmpty()
    @Type(() => Boolean)
    enabled: boolean;
}