import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entity';
import { Repository } from 'typeorm';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { TicketDto } from '../dto/ticket.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { Raffle } from '../entities/raffle.entity';

@Injectable()
export class TicketsService {

    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(Raffle)
        private readonly raffleRepository: Repository<Raffle>,
    ) { }

    async search(page: number, size: number, enabled?: boolean, institution?: string, organizer?: string, department?: string,
        code?: string, purchaseDate?: Date, documentNumber?: string) {
        const skip = (page - 1) * size;

        const query = this.ticketRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.raffle', 'raffle')
            .where('ticket.deleted = false');

        if (enabled !== undefined) query.andWhere('ticket.enabled = :enabled', { enabled });
        if (institution !== undefined) query.andWhere('institution.id = :institution', { institution });
        if (organizer !== undefined) query.andWhere('ticket.organizer_id = :organizer', { organizer });
        if (department !== undefined) query.andWhere('institution_department.id = :department', { department });
        if (code !== undefined) query.andWhere('ticket.ticketCode = :code', { code });
        if (purchaseDate !== undefined) query.andWhere('ticket.purchaseDate = :purchaseDate', { purchaseDate });
        if (documentNumber !== undefined) query.andWhere('ticket.documentNumber = :documentNumber', { documentNumber });

        const [tickets, totalElements] = await query
            .orderBy('ticket.createdAt', 'DESC')
            .skip(skip)
            .take(size)
            .getManyAndCount();

        const totalPage = Math.ceil(totalElements / size);
        const last = page >= totalPage;

        return new PagedResponse<TicketDto>(tickets.map(r => r.toDto()), page, size, totalPage, totalElements, last);
    }

    async findOne(id: string) {
        const ticket = await this.ticketRepository.findOne({ where: { id, deleted: false } });
        return ticket?.toDto();
    }

    async createWhenLoggedUser(createTicketDto: TicketDto, jwtDto: JwtDto) {
        const { purchaseTotal, raffle_id } = createTicketDto;

        const raffle = await this.raffleRepository.findOne({ where: { id: raffle_id, deleted: false }, relations: ['raffleSerie'] });

        if (!raffle) return undefined;

        let tickets: Ticket[] = [];
        for (let i = 0; i < purchaseTotal; i++) {
            createTicketDto.ticketCode = raffle.raffleSerie.getCode();
            tickets.push(Ticket.fromDto(createTicketDto, jwtDto.sub));
            raffle.raffleSerie.update(jwtDto.sub);
        }

        await this.raffleRepository.save(raffle);
        tickets = await this.ticketRepository.save(tickets);

        return tickets.map(t => t.toDto());
    }

    async createWhenIsNotLoggedUser(createTicketDto: TicketDto) {
        const { purchaseTotal, raffle_id } = createTicketDto;

        const raffle = await this.raffleRepository.findOne({ where: { id: raffle_id, deleted: false }, relations: ['raffleSerie'] });

        if (!raffle) return undefined;

        let tickets: Ticket[] = [];
        for (let i = 0; i < purchaseTotal; i++) {
            createTicketDto.ticketCode = raffle.raffleSerie.getCode();
            tickets.push(Ticket.fromDto(createTicketDto, ''));
            raffle.raffleSerie.update(createTicketDto.documentNumber);
        }

        await this.raffleRepository.save(raffle);
        tickets = await this.ticketRepository.save(tickets);

        return tickets.map(t => t.toDto());
    }
}
