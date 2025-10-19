import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RoleDto {

  @IsOptional()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  code: string;


  @IsString()
  @IsNotEmpty()
  description: string;
}
