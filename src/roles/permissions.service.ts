import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../roles/entities/permission.entity';
import { PermissionDto } from './dto/permission.dto';
import { UpdatePermissionDto } from '../roles/dto/update-permission.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  async create(createPermissionDto: PermissionDto, jwtDto: JwtDto) {
    let permission = Permission.fromDto(createPermissionDto, jwtDto.sub);
    permission = await this.permissionRepository.save(permission);

    return permission.toDto();
  }

  async search(page: number, size: number, enabled?: boolean) {
    const skip = (page - 1) * size;

    const [permissions, totalElements] = await this.permissionRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: skip,
      take: size,
      where: [enabled !== undefined ? { enabled: enabled } : {}],
    });

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<PermissionDto>(permissions.map(p => p.toDto()), page, size, totalPage, totalElements, last);
  }

  async find(id: string) {
    const permission = await this.permissionRepository.findOne({ where: { id, deleted: false } });
    return permission?.toDto();
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, jwtDto: JwtDto) {
    let permission = await this.permissionRepository.findOne({ where: { id, deleted: false } });
    if (!permission) return undefined;

    permission.update(updatePermissionDto, jwtDto.sub);
    permission = await this.permissionRepository.save(permission);
    return permission.toDto();
  }

  async delete(id: string, jwtDto: JwtDto) {
    let permission = await this.permissionRepository.findOne({ where: { id, deleted: false } });

    if (!permission) return undefined;

    permission.delete(jwtDto.sub);
    permission = await this.permissionRepository.save(permission);
    return permission?.id;
  }
}