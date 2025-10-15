import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../roles/entities/role-permission.entity';
import { CreateRolePermissionDto } from '../roles/dto/create-role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(createRolePermissionDto: CreateRolePermissionDto): Promise<RolePermission> {
    const rp = this.rolePermissionRepository.create(createRolePermissionDto);
    return await this.rolePermissionRepository.save(rp);
  }

  async remove(role_id: number, permission_id: number): Promise<void> {
    await this.rolePermissionRepository.delete({ role_id, permission_id });
  }

  async findAll(): Promise<RolePermission[]> {
    return await this.rolePermissionRepository.find({ relations: ['role', 'permission'] });
  }

  async findByRole(role_id: number): Promise<RolePermission[]> {
    return await this.rolePermissionRepository.find({
      where: { role_id },
      relations: ['permission'],
    });
  }

  async findByPermission(permission_id: number): Promise<RolePermission[]> {
    return await this.rolePermissionRepository.find({
      where: { permission_id },
      relations: ['role'],
    });
  }
}