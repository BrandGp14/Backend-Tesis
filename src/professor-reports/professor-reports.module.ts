import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorReportsService } from './professor-reports.service';
import { ProfessorReportsController } from './professor-reports.controller';
import { ReportEmailService } from './services/report-email.service';
import { Raffle } from '../raffles/entities/raffle.entity';
import { RaffleNumber } from '../raffles/entities/raffle-number.entity';
import { User } from '../users/entities/user.entity';
import { ProfessorUserAssignment } from '../professor-assignments/entities/professor-user-assignment.entity';
import { ReportEmailLog } from './entities/report-email-log.entity';
import { EmailSenderUtil } from '../common/utils/email.sender.util';
import { JWTAuthModule } from '../jwt-auth/jwt-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Raffle,
      RaffleNumber,
      User,
      ProfessorUserAssignment,
      ReportEmailLog
    ]),
    JWTAuthModule
  ],
  controllers: [ProfessorReportsController],
  providers: [
    ProfessorReportsService,
    ReportEmailService,
    EmailSenderUtil
  ],
  exports: [ProfessorReportsService, ReportEmailService]
})
export class ProfessorReportsModule {}