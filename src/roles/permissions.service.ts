import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../roles/entities/permission.entity';
import { CreatePermissionDto } from '../roles/dto/create-permission.dto';
import { UpdatePermissionDto } from '../roles/dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async findOne(id: number): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null> {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}