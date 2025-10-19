import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { RoleDto } from '../dto/role.dto';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  description: string;

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

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  toDto(): RoleDto {
    const dto = new RoleDto();
    dto.id = this.id;
    dto.code = this.code;
    dto.description = this.description;
    return dto;
  }
}
