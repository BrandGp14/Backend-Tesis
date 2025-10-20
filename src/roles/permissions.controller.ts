import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionDto } from './dto/permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthService)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  create(@Body() createPermissionDto: PermissionDto, @Req() req: { user: JwtDto }) {
    const permission = this.permissionsService.create(createPermissionDto, req.user);
    return ApiResponse.success(permission);
  }

  @Get('/search')
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
    @Query('enabled') enabled?: boolean,
  ) {
    const permissions = this.permissionsService.search(page, size, enabled);
    return ApiResponse.success(permissions);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    const permission = this.permissionsService.find(id);
    if (!permission) return ApiResponse.notFound('Permiso no encontrado');
    return ApiResponse.success(permission);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @Req() req: { user: JwtDto }) {
    const permission = this.permissionsService.update(id, updatePermissionDto, req.user);
    if (!permission) return ApiResponse.notFound('Permiso no encontrado');
    return ApiResponse.success(permission);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: JwtDto }) {
    const permission = this.permissionsService.delete(id, req.user);
    if (!permission) return ApiResponse.notFound('Permiso no encontrado');
    return ApiResponse.deleted();
  }
}