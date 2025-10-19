import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthService)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/search')
  @ApiOperation({ summary: 'Lista paginada de usuarios' })
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
    @Query('enabled') enabled?: boolean,
  ) {
    const users = await this.usersService.search(page, size, enabled);

    return ApiResponse.success(users);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.find(id);
    if (!user) return ApiResponse.notFound('User not found');
    return ApiResponse.success(user);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  async create(@Body() createUserDto: UserDto, @Req() req: { user: JwtDto }) {
    const user = await this.usersService.create(createUserDto, req.user);
    return ApiResponse.success(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: { user: JwtDto }) {
    return this.usersService.update(id, updateUserDto, req.user);
  }
}
