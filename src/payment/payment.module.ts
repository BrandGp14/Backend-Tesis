import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTicket } from './entity/payment-ticket.entity';
import { Payment } from './entity/payment.entity';
import { PaymentTransaction } from './entity/payment-transaction.entity';
import { RafflesModule } from 'src/raffles/raffles.module';
import { TicketsService } from 'src/raffles/tickets/tickets.service';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';
import { NiubizAuthService } from './niubiz/niubiz-auth.service';
import { NiubizPaymentService } from './niubiz/niubiz-payment.service';
import { PaymentIntegrationService } from './integration/payment-integration.service';

@Module({
  imports: [
    EntitiesModuleModule,
    RafflesModule,
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
    ConfigModule,
  ],
  controllers: [PaymentController, PaymentGatewayController],
  providers: [PaymentService, TicketsService, NiubizAuthService, NiubizPaymentService, PaymentIntegrationService],
  exports: [NiubizAuthService, NiubizPaymentService, PaymentIntegrationService],
})
export class PaymentModule { }
