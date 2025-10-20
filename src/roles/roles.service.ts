import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async search(page: number, size: number, enabled?: boolean) {
    const skip = (page - 1) * size;

    const [roles, totalElements] = await this.roleRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: skip,
      take: size,
      where: [enabled !== undefined ? { enabled: enabled } : {}],
    });

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<RoleDto>(roles.map(r => r.toDto()), page, size, totalPage, totalElements, last);
  }

  async find(id: string) {
    const role = await this.getRoleWithRelations(id, ['rolePermissions', 'rolePermissions.permission']);
    return role?.toDto();
  }

  async create(createRoleDto: RoleDto, jwtDto: JwtDto) {
    let role = Role.fromDto(createRoleDto, jwtDto.sub);

    role = await this.roleRepository.save(role);

    const roleI = await this.getRoleWithRelations(role.id, ['rolePermissions', 'rolePermissions.permission']);

    return roleI?.toDto();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, jwtDto: JwtDto) {
    let role = await this.getRoleWithRelations(id, ['rolePermissions', 'rolePermissions.permission']);

    if (!role) return undefined;

    role.update(updateRoleDto, jwtDto.sub);
    role = await this.roleRepository.save(role);

    role = await this.getRoleWithRelations(id, ['rolePermissions', 'rolePermissions.permission']);

    return role?.toDto();
  }

  async delete(id: string, jwtDto: JwtDto) {
    let role = await this.getRoleWithRelations(id, ['rolePermissions']);
    if (!role) return undefined;

    role.delete(jwtDto.sub);
    role = await this.roleRepository.save(role);

    return role?.id
  }

  private async getRoleWithRelations(id: string, relationsI: string[]) {
    return await this.roleRepository.findOne({ where: { id, deleted: false }, relations: relationsI ? relationsI : [] });
  }
}
