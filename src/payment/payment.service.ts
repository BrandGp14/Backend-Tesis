import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entity/payment.entity';
import { TicketsService } from 'src/raffles/tickets/tickets.service';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { PaymentDto } from './dto/payment.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { PaymentTicket } from './entity/payment-ticket.entity';

@Injectable()
export class PaymentService {

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly ticketService: TicketsService,
    ) { }

    async search(page: number, size: number, enabled?: boolean, raffleId?: string) {
        const skip = (page - 1) * size;

        const query = this.paymentRepository.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.paymentTickets', 'paymentTicket')
            .where('payment.deleted = false');

        if (enabled !== undefined) query.andWhere('payment.enabled = :enabled', { enabled });
        if (raffleId !== undefined) query.andWhere('payment.raffle_id = :raffleId', { raffleId });

        const [payments, totalElements] = await query
            .orderBy('payment.createdAt', 'DESC')
            .skip(skip)
            .take(size)
            .getManyAndCount();

        const totalPage = Math.ceil(totalElements / size);
        const last = page >= totalPage;

        return new PagedResponse<PaymentDto>(payments.map(r => r.toDto()), page, size, totalPage, totalElements, last);
    }

    async findOne(id: string) {
        const payment = await this.paymentRepository.findOne({ where: { id, deleted: false }, relations: ['paymentTickets', 'paymentTickets.ticket'] });
        return payment?.toDto();
    }

    async createWhenLoggedUser(createPaymentDto: PaymentDto, jwtDto: JwtDto) {
        const tickets = await this.ticketService.createWhenLoggedUser(createPaymentDto.ticket, jwtDto);
        if (!tickets) return undefined;

        const paymentTickets = tickets.map(t => PaymentTicket.fromDto(t, jwtDto.sub));
        const payment = Payment.fromDto(createPaymentDto, paymentTickets, jwtDto.sub);
        await this.paymentRepository.save(payment);

        const paymentI = await this.paymentRepository.findOne({ where: { id: payment.id }, relations: ['paymentTickets', 'paymentTickets.ticket'] });

        return paymentI?.toDto();

    }

    async createWhenNotLoggedUser(createPaymentDto: PaymentDto) {
        const tickets = await this.ticketService.createWhenIsNotLoggedUser(createPaymentDto.ticket);
        if (!tickets) return undefined;

        const paymentTickets = tickets.map(t => PaymentTicket.fromDto(t, t.documentNumber));
        const payment = Payment.fromDto(createPaymentDto, paymentTickets, createPaymentDto.ticket.documentNumber);
        await this.paymentRepository.save(payment);

        const paymentI = await this.paymentRepository.findOne({ where: { id: payment.id }, relations: ['paymentTickets', 'paymentTickets.ticket'] });

        return paymentI?.toDto();
    }
}
