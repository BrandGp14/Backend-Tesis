import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  role_id: number;

  @Column({ type: 'uuid', nullable: false })
  permission_id: number;

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
}
