import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RaffleImageDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsNumber()
    @IsNotEmpty()
    displayOrder: number;

    @IsBoolean()
    @IsOptional()
    enabled: boolean;
}