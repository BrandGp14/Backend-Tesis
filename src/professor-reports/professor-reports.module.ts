import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorReportsService } from './professor-reports.service';
import { ProfessorReportsController } from './professor-reports.controller';
import { Raffle } from '../raffles/entities/raffle.entity';
import { Professor } from '../professors/entities/professor.entity';
import { RaffleNumber } from '../raffles/entities/raffle-number.entity';
import { JWTAuthModule } from '../jwt-auth/jwt-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Raffle,
      Professor,
      RaffleNumber
    ]),
    JWTAuthModule
  ],
  controllers: [ProfessorReportsController],
  providers: [ProfessorReportsService],
  exports: [ProfessorReportsService]
})
export class ProfessorReportsModule {}