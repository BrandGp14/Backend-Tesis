import { ApiProperty } from '@nestjs/swagger';

export class UserAssignmentDto {
  @ApiProperty({
    description: 'ID de la asignación',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario asignado',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  userId: string;

  @ApiProperty({
    description: 'Información del usuario',
    example: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@institución.edu'
    }
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Estado de la asignación',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de asignación',
    example: '2025-12-09T10:30:00.000Z'
  })
  assignedDate: Date;

  @ApiProperty({
    description: 'Notas de la asignación',
    example: 'Usuario especializado en rifas benéficas',
    required: false
  })
  assignmentNotes?: string;
}

export class AssignmentResponseDto {
  @ApiProperty({
    description: 'ID de la asignación',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'ID del profesor',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  professorId: string;

  @ApiProperty({
    description: 'Información del profesor',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user: {
        firstName: 'Dr. María',
        lastName: 'González',
        email: 'maria.gonzalez@universidad.edu'
      },
      specialization: 'Gestión de Proyectos',
      academicTitle: 'PhD'
    }
  })
  professor: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    specialization: string;
    academicTitle?: string;
  };

  @ApiProperty({
    description: 'ID del organizador que hizo la asignación',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  organizerId: string;

  @ApiProperty({
    description: 'ID del departamento',
    example: '550e8400-e29b-41d4-a716-446655440003'
  })
  departmentId: string;

  @ApiProperty({
    description: 'Información del departamento',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      description: 'Departamento de Ingeniería de Sistemas'
    }
  })
  department: {
    id: string;
    description: string;
  };

  @ApiProperty({
    description: 'Estado de la asignación',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de asignación',
    example: '2025-12-09T10:30:00.000Z'
  })
  assignedDate: Date;

  @ApiProperty({
    description: 'Fecha de desasignación (si aplica)',
    example: null,
    required: false
  })
  unassignedDate?: Date;

  @ApiProperty({
    description: 'Notas de la asignación',
    example: 'Asignación para proyecto semestral',
    required: false
  })
  assignmentNotes?: string;

  @ApiProperty({
    description: 'Usuario asignado',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      firstName: 'Ana',
      lastName: 'Rodríguez',
      email: 'ana.rodriguez@estudiante.edu'
    }
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-12-09T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-12-09T10:30:00.000Z'
  })
  updatedAt: Date;
}

export class ProfessorCapacityDto {
  @ApiProperty({
    description: 'ID del profesor',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  professorId: string;

  @ApiProperty({
    description: 'Información del profesor',
    example: {
      firstName: 'Dr. Carlos',
      lastName: 'Mendoza',
      email: 'carlos.mendoza@universidad.edu'
    }
  })
  professorInfo: {
    firstName: string;
    lastName: string;
    email: string;
    specialization: string;
  };

  @ApiProperty({
    description: 'Número actual de usuarios asignados',
    example: 15
  })
  currentAssignments: number;

  @ApiProperty({
    description: 'Capacidad máxima (siempre 20)',
    example: 20
  })
  maxCapacity: number;

  @ApiProperty({
    description: 'Espacios disponibles',
    example: 5
  })
  availableSlots: number;

  @ApiProperty({
    description: 'Porcentaje de ocupación',
    example: 75
  })
  occupancyPercentage: number;

  @ApiProperty({
    description: 'Si puede recibir más asignaciones',
    example: true
  })
  canAssignMore: boolean;
}