import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InstitutionDepartment } from '../../institutes/entities/institution-department.entity';
import { Institution } from '../../institutes/entities/institute.entity';

@Entity('professor_user_assignments')
@Index(['professorId', 'userId'], { unique: true, where: '"deleted" = false' })
@Index(['professorId', 'isActive'])
@Index(['organizerId', 'departmentId'])
export class ProfessorUserAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  professorId: string;

  @Column()
  userId: string;

  @Column()
  organizerId: string;

  @Column()
  departmentId: string;

  @Column()
  institutionId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  unassignedDate: Date | null;

  @Column({ type: 'text', nullable: true })
  assignmentNotes: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'professorId' })
  professor: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @ManyToOne(() => InstitutionDepartment, { eager: true })
  @JoinColumn({ name: 'departmentId' })
  department: InstitutionDepartment;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institutionId' })
  institution: Institution;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  static fromDto(dto: any, creatorUserId: string): ProfessorUserAssignment {
    const assignment = new ProfessorUserAssignment();
    assignment.professorId = dto.professorId;
    assignment.userId = dto.userId;
    assignment.organizerId = dto.organizerId;
    assignment.departmentId = dto.departmentId;
    assignment.institutionId = dto.institutionId;
    assignment.assignmentNotes = dto.assignmentNotes;
    assignment.createdBy = creatorUserId;
    assignment.updatedBy = creatorUserId;
    return assignment;
  }

  unassign(userId: string): void {
    this.isActive = false;
    this.unassignedDate = new Date();
    this.updatedBy = userId;
  }

  delete(userId: string): void {
    this.isActive = false;
    this.deleted = true;
    this.unassignedDate = new Date();
    this.updatedBy = userId;
  }

  reactivate(userId: string): void {
    this.isActive = true;
    this.unassignedDate = null;
    this.updatedBy = userId;
  }

  updateNotes(notes: string, userId: string): void {
    this.assignmentNotes = notes;
    this.updatedBy = userId;
  }

  toDto(): any {
    return {
      id: this.id,
      professorId: this.professorId,
      userId: this.userId,
      organizerId: this.organizerId,
      departmentId: this.departmentId,
      institutionId: this.institutionId,
      isActive: this.isActive,
      assignedDate: this.assignedDate,
      unassignedDate: this.unassignedDate,
      assignmentNotes: this.assignmentNotes,
      professor: this.professor ? {
        id: this.professor.id,
        firstName: this.professor.firstName,
        lastName: this.professor.lastName,
        email: this.professor.email,
        specialization: 'Profesor', // Valor por defecto ya que User no tiene specialization
        academicTitle: 'PhD' // Valor por defecto ya que User no tiene academicTitle
      } : null,
      user: this.user ? {
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email
      } : null,
      department: this.department ? {
        id: this.department.id,
        description: this.department.description
      } : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}