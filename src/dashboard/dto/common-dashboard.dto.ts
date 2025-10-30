import { Type } from "class-transformer";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CommonDashboardDto {
    @IsDateString()
    dateFrom: Date;

    @IsDateString()
    dateTo: Date;

    @IsArray()
    @Type(() => CommonResultDashboardDto)
    result: CommonResultDashboardDto[] = [];
}

export class CommonResultDashboardDto {
    @IsNumber()
    year: number;

    @IsNumber()
    month: number;

    @IsNumber()
    total: number;

    @IsNumber()
    @IsOptional()
    versus: number;

    @IsString()
    @IsOptional()
    object: string;
}