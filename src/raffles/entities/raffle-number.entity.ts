import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Raffle } from './raffle.entity';
import { RaffleNumberDto } from '../dto/raffle-number.dto';
import { RaffleNumberStatus } from '../enums/raffle-number-status.enum';

@Entity('raffle_numbers')
@Index(['id', 'raffle_id', 'number', 'status'])
@Index(['reserved_by', 'reservation_expires'])
export class RaffleNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  number: number;

  @Column({ 
    type: 'enum', 
    enum: RaffleNumberStatus, 
    default: RaffleNumberStatus.AVAILABLE 
  })
  status: RaffleNumberStatus;

  @Column({ type: 'uuid', nullable: false })
  raffle_id: string;

  @Column({ type: 'uuid', nullable: true })
  reserved_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reservation_expires: Date | null;

  @Column({ type: 'uuid', nullable: true })
  ticket_id: string | null;

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

  @ManyToOne(() => Raffle, (raffle) => raffle.raffleNumbers)
  @JoinColumn({ name: 'raffle_id' })
  raffle: Raffle;

  static create(raffleId: string, number: number, userId: string): RaffleNumber {
    const raffleNumber = new RaffleNumber();
    raffleNumber.raffle_id = raffleId;
    raffleNumber.number = number;
    raffleNumber.status = RaffleNumberStatus.AVAILABLE;
    raffleNumber.createdBy = userId;
    raffleNumber.updatedBy = userId;
    return raffleNumber;
  }

  reserve(userId: string, expirationMinutes: number = 15): void {
    this.status = RaffleNumberStatus.RESERVED;
    this.reserved_by = userId;
    this.reservation_expires = new Date(Date.now() + expirationMinutes * 60 * 1000);
    this.updatedBy = userId;
  }

  sell(ticketId: string, userId: string): void {
    this.status = RaffleNumberStatus.SOLD;
    this.ticket_id = ticketId;
    this.reserved_by = null;
    this.reservation_expires = null;
    this.updatedBy = userId;
  }

  release(userId: string): void {
    this.status = RaffleNumberStatus.AVAILABLE;
    this.reserved_by = null;
    this.reservation_expires = null;
    this.updatedBy = userId;
  }

  isReservationExpired(): boolean {
    if (!this.reservation_expires) return false;
    return new Date() > this.reservation_expires;
  }

  toDto(): RaffleNumberDto {
    const dto = new RaffleNumberDto();
    dto.id = this.id;
    dto.number = this.number;
    dto.status = this.status;
    dto.raffle_id = this.raffle_id;
    // Mapear null a undefined para respetar tipos opcionales del DTO
    dto.reserved_by = this.reserved_by ?? undefined;
    dto.reservation_expires = this.reservation_expires ?? undefined;
    dto.ticket_id = this.ticket_id ?? undefined;
    dto.enabled = this.enabled;
    return dto;
  }
}