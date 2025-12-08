import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorsController } from './professors.controller';
import { ProfessorsService } from './professors.service';
import { Professor } from './entities/professor.entity';
import { User } from '../users/entities/user.entity';
import { InstitutionDepartment } from '../institutes/entities/institution-department.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professor, User, InstitutionDepartment, UserRole, Role])],
  controllers: [ProfessorsController],
  providers: [ProfessorsService],
  exports: [ProfessorsService],
})
export class ProfessorsModule {}