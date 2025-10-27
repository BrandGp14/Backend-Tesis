import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Payment } from "./payment.entity";
import { Ticket } from "src/raffles/entities/ticket.entity";
import { TicketDto } from "src/raffles/dto/ticket.dto";

@Entity('payment_tickets')
@Index(['id', 'payment_id', 'ticket_id'])
export class PaymentTicket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    payment_id: string;

    @Column({ type: 'uuid', nullable: false })
    ticket_id: string;

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

    @ManyToOne(() => Payment, (payment) => payment.paymentTickets)
    @JoinColumn({ name: 'payment_id' })
    payment: Payment;

    @ManyToOne(() => Ticket, (ticket) => ticket.paymentTickets)
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    static fromDto(ticket: TicketDto, userId: string) {
        const paymentTicket = new PaymentTicket();
        paymentTicket.ticket_id = ticket.id;
        paymentTicket.createdBy = userId;
        paymentTicket.updatedBy = userId;
        return paymentTicket;
    }
}