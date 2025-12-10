import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorAssignmentsController } from './professor-assignments.controller';
import { ProfessorAssignmentsService } from './professor-assignments.service';
import { ProfessorUserAssignment } from './entities/professor-user-assignment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { JWTAuthModule } from '../jwt-auth/jwt-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfessorUserAssignment,
      User,
      UserRole
    ]),
    JWTAuthModule
  ],
  controllers: [ProfessorAssignmentsController],
  providers: [ProfessorAssignmentsService],
  exports: [ProfessorAssignmentsService]
})
export class ProfessorAssignmentsModule {}