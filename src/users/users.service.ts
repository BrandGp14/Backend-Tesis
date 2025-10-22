import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { UserRole } from './entities/user-role.entity';
import { Institution } from 'src/institutes/entities/institute.entity';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async search(page: number, size: number, enabled?: boolean) {
    const skip = (page - 1) * size;

    const [users, totalElements] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: skip,
      take: size,
      where: [enabled !== undefined ? { enabled: enabled } : {}, { deleted: false }],
    });

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<UserDto>(users.map(u => u.toDto()), page, size, totalPage, totalElements, last);
  }

  async find(id: string) {
    const user = await this.usersRepository.findOne({ where: { id, deleted: false }, relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'] });
    if (!user) return undefined;
    return user.toDto();
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email, deleted: false }, relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'] });
    if (!user) return undefined;
    return user.toDto();
  }

  async create(dto: UserDto, jwtDto: JwtDto) {
    let user = User.fromDto(dto, jwtDto.sub);
    user = await this.usersRepository.save(user);
    return user.toDto();
  }

  async update(id: string, dto: UpdateUserDto, jwtDto: JwtDto) {
    let user = await this.usersRepository.findOne({ where: { id, deleted: false }, relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'] });

    if (!user) throw new NotFoundException('User not found');

    user.update(dto, jwtDto.sub);

    user = await this.usersRepository.save(user);

    user = await this.usersRepository.findOne({ where: { id: user.id }, relations: ['userRoles', 'userRoles.role', 'userRoles.institution', 'userRoles.user'] });

    return user?.toDto();
  }
}
