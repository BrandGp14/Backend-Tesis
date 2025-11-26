import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RaffleGiftImageDto {
    @ApiProperty({ 
        example: "uuid-here",
        description: "ID de la imagen (opcional para creación)",
        required: false
    })
    @IsString()
    @IsOptional()
    id: string;

    @ApiProperty({ 
        example: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        description: "URL de la imagen del premio"
    })
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @ApiProperty({ 
        example: true,
        description: "Si la imagen está habilitada",
        required: false
    })
    @IsBoolean()
    @IsOptional()
    enabled: boolean;
}