import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayMaxSize, ArrayMinSize, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class AssignUsersToProfessorDto {
  @ApiProperty({
    description: 'ID del profesor al que se asignarán los usuarios',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  professorId: string;

  @ApiProperty({
    description: 'Array de IDs de usuarios a asignar (máximo 20)',
    example: ['user1-uuid', 'user2-uuid', 'user3-uuid'],
    type: [String],
    maxItems: 20,
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe asignar al menos 1 usuario' })
  @ArrayMaxSize(20, { message: 'No se pueden asignar más de 20 usuarios por profesor' })
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'ID del departamento (debe coincidir con el del profesor)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({
    description: 'ID de la institución',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;

  @ApiProperty({
    description: 'Notas adicionales sobre la asignación',
    example: 'Usuarios asignados para el proyecto de rifas del primer semestre',
    required: false
  })
  @IsOptional()
  @IsString()
  assignmentNotes?: string;
}