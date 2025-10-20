import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RolePermissionDto } from '../dto/role-permission.dto';

@Entity('role_permissions')
@Index(['id', 'role_id', 'permission_id'])
export class RolePermission {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  role_id: string;

  @Column({ type: 'uuid', nullable: false })
  permission_id: string;

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

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  static fromDto(rolePermissionDto: RolePermissionDto, userId: string) {
    const rolePermission = new RolePermission();
    rolePermission.permission_id = rolePermissionDto.permission_id;
    rolePermission.createdBy = userId;
    rolePermission.updatedBy = userId;

    if (rolePermissionDto.role_id) rolePermission.role_id = rolePermissionDto.role_id;
    return rolePermission;
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;
  }

  // toDto(): RolePermissionDto {
  //   const dto = new RolePermissionDto();
  //   dto.role_id = this.role_id;
  //   dto.role_code = this.role.code;
  //   dto.roleDescription = this.role.description;
  //   dto.permission_id = this.permission_id;
  //   dto.permission_code = this.permission.code;
  //   dto.permissionDescription = this.permission.description;
  //   return dto;
  // }
}
