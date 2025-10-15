import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('raffles')
export class Raffle {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  prize: string;

  @Column({ name: 'prizeValue', type: 'float', nullable: true })
  prizeValue?: number;

  @Column({ name: 'startDate' })
  startDate: Date;

  @Column({ name: 'endDate' })
  endDate: Date;

  @Column({ name: 'drawDate', nullable: true })
  drawDate?: Date;

  @Column({ name: 'streamUrl', nullable: true })
  streamUrl?: string;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @Column({ name: 'isCompleted', default: false })
  isCompleted: boolean;

  @Column({ name: 'departmentId' })
  departmentId: string;

  @Column({ name: 'organizerId' })
  organizerId: string;

  @Column({ name: 'maxTickets', default: 3000 })
  maxTickets: number;

  @Column({ name: 'flyerUrl', nullable: true })
  flyerUrl?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}