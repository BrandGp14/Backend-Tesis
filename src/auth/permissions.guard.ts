import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../roles/entities/role-permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false; // No hay usuario autenticado

    // Aquí asumimos que user.role.id está disponible en el request
    const roleId = user.role?.id || user.role_id; // adapta según cómo guardas el rol

    // Busca los permisos asociados al rol del usuario
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role_id: roleId },
      relations: ['permission'],
    });

    const userPermissionNames = rolePermissions.map(rp => rp.permission.code);

    // Deben tener TODOS los permisos requeridos
    return requiredPermissions.every(p => userPermissionNames.includes(p));
  }
}