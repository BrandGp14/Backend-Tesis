import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { Professor } from '../../professors/entities/professor.entity';

@Entity('users')
@Index('UQ_USER_EMAIL_UNIQUE_ON_DELETED_FALSE', ['email'], { unique: true, where: '"deleted" = false' })
@Index(['id', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  google_id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  student_code?: string;

  @Column({ nullable: true })
  document_number: string;

  @Column({ nullable: true })
  document_type: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  profile_photo_url?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: false })
  last_login: Date = new Date();

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

  @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
  userRoles: UserRole[];

  @OneToMany(() => Raffle, (raffle) => raffle.user)
  raffles: Raffle[];

  @OneToMany(() => Professor, (professor) => professor.user)
  professors: Professor[];

  @OneToMany(() => User, (user) => user.parent_id, { cascade: true })
  assigned: User[];

  @ManyToOne(() => User, (user) => user.assigned)
  @JoinColumn({ name: 'parent_id' })
  parent_id: User;

  static fromDto(userDto: UserDto, assigned: User[], userId: string) {
    const user = new User();
    user.email = userDto.email;
    user.firstName = userDto.firstName;
    user.lastName = userDto.lastName;
    user.student_code = userDto.student_code;
    user.document_number = userDto.document_number;
    user.document_type = userDto.document_type;
    user.phone = userDto.phone;
    user.profile_photo_url = userDto.picture;
    user.createdBy = userId;
    user.updatedBy = userId;

    if (userDto.roles.length > 0) {
      user.userRoles = [
        ...userDto.roles.map((userRoleDto) => UserRole.fromDto(userRoleDto, userId))
      ]
    }

    user.assigned = [...assigned]

    // user.institution_id = userDto.institution!.id;

    return user;
  }

  update(user: UpdateUserDto, userId: string) {
    Object.assign(this, user);

    this.userRoles.forEach((userRole) => {
      const userRoleOp = user.roles?.find((userRoleOp) => userRoleOp.id === userRole.id);
      if (userRoleOp) userRole.update(userRoleOp, userId);
      else userRole.delete(userId);
    })

    this.userRoles = [
      ...this.userRoles,
      ...user.roles!.filter((userRole) => !userRole.id).map((userRole) => UserRole.fromDto(userRole, userId))
    ]

    if (this.assigned) {
      this.assigned.forEach((assigned) => {
        const userOp = user.assigned?.find((userOp) => userOp.id === assigned.id);
        if (userOp) assigned.update(userOp, userId);
        else assigned.delete(userId);
      })
    }

    // this.institution_id = user.institution!.id;

    this.updatedBy = userId;
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;
  }

  login() {
    this.last_login = new Date();
    this.updatedBy = this.id;
  }

  toDto(): UserDto {
    const dto = new UserDto();
    dto.id = this.id;
    dto.email = this.email;
    dto.firstName = this.firstName;
    dto.lastName = this.lastName;
    dto.student_code = this.student_code || undefined;
    dto.document_number = this.document_number;
    dto.document_type = this.document_type;
    dto.phone = this.phone;
    dto.picture = this.profile_photo_url;
    dto.last_login = this.last_login;
    dto.enabled = this.enabled;

    if (this.userRoles) dto.roles = this.userRoles.map(ur => ur.toDto());
    if (this.assigned) dto.assigned = this.assigned.map(u => u.toDto());

    return dto;
  }
}
