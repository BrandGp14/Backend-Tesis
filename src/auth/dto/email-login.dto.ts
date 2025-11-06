import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailLoginDto {
  @ApiProperty({ 
    example: 'carlos.rodriguez@wasirifa.digital',
    description: 'Email del usuario' 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'Contraseña del usuario' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}