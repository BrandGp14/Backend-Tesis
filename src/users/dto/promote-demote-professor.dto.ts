import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class PromoteToProfessorDto {
    @ApiProperty({ example: 'juan.perez@tecsup.edu.pe', description: 'Email del usuario a promover' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'uuid-departamento', description: 'ID del departamento al que pertenecerá el profesor' })
    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @ApiProperty({ example: 'Ingeniería de Sistemas', description: 'Especialización del profesor', required: false })
    @IsString()
    @IsOptional()
    specialization?: string;
}

export class DemoteFromProfessorDto {
    @ApiProperty({ example: 'juan.perez@tecsup.edu.pe', description: 'Email del profesor a degradar' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class PromoteToProfessorResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    previousRole: string;

    @ApiProperty()
    newRole: string;

    @ApiProperty()
    departmentId: string;

    @ApiProperty()
    departmentName: string;

    @ApiProperty()
    promotedAt: string;
}

export class DemoteFromProfessorResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    previousRole: string;

    @ApiProperty()
    newRole: string;

    @ApiProperty()
    demotedAt: string;
}
