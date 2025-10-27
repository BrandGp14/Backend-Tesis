import { Raffle } from "src/raffles/entities/raffle.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PaymentTicket } from "./payment-ticket.entity";
import { PaymentDto } from "../dto/payment.dto";

@Entity('payments')
@Index(['id', 'raffle_id'])
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    gatewayPaymentId: string;

    @Column()
    total: number;

    @Column()
    totalWithTax: number;

    @Column()
    currencyCode: string;

    @Column()
    currencySymbol: string;

    @Column()
    purchaseDate: Date;

    @Column({ type: 'uuid', nullable: false })
    raffle_id: string;

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

    @ManyToOne(() => Raffle, (raffle) => raffle.payments)
    raffle: Raffle;

    @OneToMany(() => PaymentTicket, (paymentTicket) => paymentTicket.payment, { cascade: true })
    paymentTickets: PaymentTicket[];

    static fromDto(paymentDto: PaymentDto, paymentTicket: PaymentTicket[], userId: string) {
        const payment = new Payment();
        payment.gatewayPaymentId = paymentDto.gatewayPaymentId;
        payment.total = paymentDto.total;
        payment.totalWithTax = paymentDto.totalWithTax;
        payment.currencyCode = paymentDto.currencyCode;
        payment.currencySymbol = paymentDto.currencySymbol;
        payment.purchaseDate = paymentDto.purchaseDate;
        payment.raffle_id = paymentDto.raffle_id;
        payment.createdBy = userId;
        payment.updatedBy = userId;

        if (paymentDto.enabled !== undefined) payment.enabled = paymentDto.enabled;
        if (paymentTicket) payment.paymentTickets = paymentTicket;

        return payment;
    }

    toDto(): PaymentDto {
        const dto = new PaymentDto();
        dto.id = this.id;
        dto.gatewayPaymentId = this.gatewayPaymentId;
        dto.total = this.total;
        dto.totalWithTax = this.totalWithTax;
        dto.currencyCode = this.currencyCode;
        dto.currencySymbol = this.currencySymbol;
        dto.purchaseDate = this.purchaseDate;
        dto.raffle_id = this.raffle_id;
        dto.enabled = this.enabled;

        if (this.paymentTickets) dto.tickets = this.paymentTickets.map(t => t.ticket.toDto())

        return dto;
    }

}