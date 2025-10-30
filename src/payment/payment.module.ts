import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTicket } from './entity/payment-ticket.entity';
import { Payment } from './entity/payment.entity';
import { RafflesModule } from 'src/raffles/raffles.module';
import { TicketsService } from 'src/raffles/tickets/tickets.service';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';

@Module({
  imports: [EntitiesModuleModule],
  controllers: [PaymentController],
  providers: [PaymentService, TicketsService],
})
export class PaymentModule { }
