import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { Raffle } from './entities/raffle.entity';
import { UploadFileModule } from 'src/upload-file/upload-file.module';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { Ticket } from './entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Raffle, Ticket]), UploadFileModule],
  controllers: [RafflesController, TicketsController],
  providers: [RafflesService, TicketsService],
  exports: [TypeOrmModule],
})
export class RafflesModule { }
