import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Institution } from 'src/institutes/entities/institute.entity';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Institution])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
