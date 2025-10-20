import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { RoleDto } from '../dto/role.dto';
import { RolePermissionDto } from '../dto/role-permission.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Entity('roles')
@Index('UQ_ROLE_CODE_UNIQUE_ON_DELETED_FALSE', ['code'], { unique: true, where: '"deleted" = false' })
@Index(['id', 'code'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
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

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, { cascade: true })
  rolePermissions: RolePermission[];

  static fromDto(roleDto: RoleDto, userId: string) {
    const role = new Role();
    role.code = roleDto.code;
    role.description = roleDto.description;
    role.createdBy = userId;
    role.updatedBy = userId;

    if (roleDto.permissions.length > 0) {
      role.rolePermissions = [
        ...roleDto.permissions.map((permissionDto) => {
          return RolePermission.fromDto({ permission_id: permissionDto.id } as RolePermissionDto, userId);
        })
      ]
    }

    return role;
  }

  update(role: UpdateRoleDto, userId: string) {
    Object.assign(this, role);
    this.updatedBy = userId;

    this.rolePermissions.forEach((rolePermission) => {
      const permission = role.permissions?.find((permission) => permission.id === rolePermission.permission_id);
      if (!permission) rolePermission.delete(userId);
    })

    this.rolePermissions = [
      ...this.rolePermissions,
      ...role.permissions!.filter((permission) => !permission.id).map((permission) => RolePermission.fromDto({ permission_id: permission.id } as RolePermissionDto, userId))
    ]
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;

    this.rolePermissions.forEach((rolePermission) => {
      rolePermission.delete(userId);
    })

    this.updatedBy = userId;
  }

  toDto(): RoleDto {
    const dto = new RoleDto();
    dto.id = this.id;
    dto.code = this.code;
    dto.description = this.description;
    dto.enabled = this.enabled;

    dto.permissions = this.rolePermissions.map(rp => rp.permission.toDto());

    return dto;
  }
}
