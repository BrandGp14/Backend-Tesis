import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: RoleDto): Promise<RoleDto> {
    let role = this.roleRepository.create(createRoleDto);
    role.createdBy = ''
    role.updatedBy = ''
    role = await this.roleRepository.save(role);
    return role.toDto();
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async findOne(id: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
