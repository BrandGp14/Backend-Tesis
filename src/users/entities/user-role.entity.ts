import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Institution } from 'src/institutes/entities/institute.entity';
import { UserRoleDto } from '../dto/user-role.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'uuid', nullable: false })
  role_id: string;

  @Column({ type: 'uuid', nullable: false })
  institution_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  static fromDto(userRoleDto: UserRoleDto, userId: string) {
    const userRole = new UserRole();
    userRole.user_id = userRoleDto.user_id;
    userRole.role_id = userRoleDto.role_id;
    userRole.institution_id = userRoleDto.institution_id;
    userRole.createdBy = userId;
    userRole.updatedBy = userId;
    return userRole;
  }

  update(userRole: UpdateUserRoleDto, userId: string) {
    Object.assign(this, userRole);
    this.updatedBy = userId;
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;
  }

  toDto(): UserRoleDto {
    const dto = new UserRoleDto();
    console.log(this);
    dto.id = this.id;
    dto.user_id = this.user_id;
    dto.role_id = this.role_id;
    dto.roleDescription = this.role.description;
    dto.institution_id = this.institution_id;
    dto.institutionDescription = this.institution.description;
    dto.enabled = this.enabled;

    if (this.user) dto.userDescription = this.user.firstName + ' ' + this.user.lastName;

    return dto;
  }
}
