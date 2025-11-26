import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RaffleImageDto {
    @ApiProperty({ 
        example: "uuid-here",
        description: "ID de la imagen (opcional para creación)",
        required: false
    })
    @IsString()
    @IsOptional()
    id: string;

    @ApiProperty({ 
        example: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
        description: "URL de la imagen de la rifa"
    })
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @ApiProperty({ 
        example: 1,
        description: "Orden de visualización de la imagen"
    })
    @IsNumber()
    @IsNotEmpty()
    displayOrder: number;

    @ApiProperty({ 
        example: true,
        description: "Si la imagen está habilitada",
        required: false
    })
    @IsBoolean()
    @IsOptional()
    enabled: boolean;
}