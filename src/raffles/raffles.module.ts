import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { Raffle } from './entities/raffle.entity';
import { UploadFileModule } from 'src/upload-file/upload-file.module';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { Ticket } from './entities/ticket.entity';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';
import { UploadFileService } from 'src/upload-file/upload-file.service';
import { RaffleNumbersController } from './raffle-numbers/raffle-numbers.controller';
import { RaffleNumbersService } from './raffle-numbers/raffle-numbers.service';

@Module({
  imports: [EntitiesModuleModule, UploadFileModule],
  controllers: [RafflesController, TicketsController, RaffleNumbersController],
  providers: [RafflesService, TicketsService, RaffleNumbersService],
  exports: [RaffleNumbersService],
})
export class RafflesModule { }
