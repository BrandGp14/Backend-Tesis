import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class TicketDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @IsNumber()
    @IsNotEmpty()
    numberPhone: number;

    @IsString()
    @IsOptional()
    ticketCode: string;

    @IsDateString()
    @IsNotEmpty()
    purchaseDate: Date;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Type(() => Number)
    totalWithTax: number;

    @IsNumber()
    @Type(() => Number)
    purchaseTotal: number;

    @IsString()
    @IsNotEmpty()
    raffle_id: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    enabled: boolean;
}