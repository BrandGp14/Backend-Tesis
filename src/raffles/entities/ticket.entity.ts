import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Raffle } from "./raffle.entity";
import { TicketDto } from "../dto/ticket.dto";
import { PaymentTicket } from "src/payment/entity/payment-ticket.entity";

@Entity('tickets')
@Index(['id', 'raffleId', 'ticketCode', 'purchaseDate'])
@Index(['documentNumber', 'email'])
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    fullName: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    documentNumber: string;

    @Column({ nullable: false })
    numberPhone: number;

    @Column({ nullable: false })
    ticketCode: string;

    @Column({ nullable: false })
    purchaseDate: Date;

    @Column({ nullable: false })
    price: number;

    @Column({ nullable: false })
    totalWithTax: number;

    @Column({ type: 'uuid', nullable: false })
    raffleId: string;

    @Column({ type: 'boolean', default: true })
    enabled: boolean;

    @Column({ type: 'boolean', default: false })
    deleted: boolean;

    @Column()
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    updatedBy: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Raffle, (raffle) => raffle.tickets)
    raffle: Raffle;

    @OneToMany(() => PaymentTicket, (paymentTicket) => paymentTicket.ticket)
    paymentTickets: PaymentTicket[];

    static fromDto(ticketDto: TicketDto, userId: string) {
        const ticket = new Ticket();
        ticket.fullName = ticketDto.fullName;
        ticket.email = ticketDto.email;
        ticket.documentNumber = ticketDto.documentNumber;
        ticket.numberPhone = ticketDto.numberPhone;
        ticket.ticketCode = ticketDto.ticketCode;
        ticket.purchaseDate = ticketDto.purchaseDate;
        ticket.price = ticketDto.price;
        ticket.totalWithTax = ticketDto.totalWithTax;
        ticket.createdBy = userId;
        ticket.updatedBy = userId;

        if (ticketDto.raffle_id) ticket.raffleId = ticketDto.raffle_id;

        return ticket;
    }

    toDto(): TicketDto {
        const dto = new TicketDto();
        dto.id = this.id;
        dto.fullName = this.fullName;
        dto.email = this.email;
        dto.documentNumber = this.documentNumber;
        dto.numberPhone = this.numberPhone;
        dto.ticketCode = this.ticketCode;
        dto.purchaseDate = this.purchaseDate;
        dto.price = this.price;
        dto.totalWithTax = this.totalWithTax;
        dto.raffle_id = this.raffleId;
        dto.enabled = this.enabled;
        return dto;
    }
}