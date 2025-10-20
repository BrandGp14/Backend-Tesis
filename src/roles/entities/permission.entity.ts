import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { PermissionDto } from '../dto/permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Entity('permissions')
@Index('UQ_PERMISSION_CODE_UNIQUE_ON_DELETED_FALSE', ['code'], { unique: true, where: '"deleted" = false' })
@Index(['id', 'code'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
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

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];

  static fromDto(permissionDto: PermissionDto, userId: string) {
    const permission = new Permission();
    permission.code = permissionDto.code;
    permission.description = permissionDto.description;
    permission.createdBy = userId;
    permission.updatedBy = userId;
    return permission;
  }

  update(permission: UpdatePermissionDto, userId: string) {
    Object.assign(this, permission);
    this.updatedBy = userId;
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;
  }

  toDto(): PermissionDto {
    const dto = new PermissionDto();
    dto.code = this.code;
    dto.description = this.description;
    dto.enabled = this.enabled;
    return dto;
  }
}
