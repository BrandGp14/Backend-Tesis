import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RaffleGiftImageDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsBoolean()
    @IsOptional()
    enabled: boolean;
}