import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Institution } from 'src/institutes/entities/institute.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Institution, Raffle, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [TypeOrmModule],
})
export class DashboardModule { }
