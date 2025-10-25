import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JWTAuthModule } from 'src/jwt-auth/jwt-auth.module';
import { Institution } from 'src/institutes/entities/institute.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from 'src/raffles/entities/raffle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Institution, Raffle]), JWTAuthModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule { }
