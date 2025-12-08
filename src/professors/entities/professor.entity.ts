import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InstitutionDepartment } from '../../institutes/entities/institution-department.entity';
import { UserRole } from '../../users/entities/user-role.entity';

@Entity('professors')
export class Professor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  departmentId: string;

  @Column()
  specialization: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  academicTitle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  // Relaciones
  @ManyToOne(() => User, (user) => user.professors)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => InstitutionDepartment, (department) => department.professors)
  @JoinColumn({ name: 'departmentId' })
  department: InstitutionDepartment;

  // Relación Many-to-Many con UserRoles de tipo ORGANIZER
  @ManyToMany(() => UserRole)
  @JoinTable({
    name: 'professor_organizer',
    joinColumn: { name: 'professor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organizer_role_id', referencedColumnName: 'id' }
  })
  organizerRoles: UserRole[];
}