import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';

@Module({
  imports: [EntitiesModuleModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
