import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { RaffleDto } from '../dto/raffle.dto';
import { UpdateRaffleDto } from '../dto/update-raffle.dto';
import { RaffleImage } from './rafle-image.entity';
import { Institution } from 'src/institutes/entities/institute.entity';
import { User } from 'src/users/entities/user.entity';
import { RaffleStatusReference } from '../type/raffle.status.reference';
import { InstitutionDepartment } from 'src/institutes/entities/institution-department.entity';
import { Ticket } from './ticket.entity';
import { RaffleSerie } from './raffle-serie.entity';
import { RaffleGiftImage } from './rafle-gift-image.entity';
import { Payment } from 'src/payment/entity/payment.entity';

@Entity('raffles')
@Index(['id', 'winner', 'institution_id', 'institution_department_id', 'organizer_id'])
export class Raffle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column()
  description: string;

  @Column({ nullable: false })
  currencyCode: string;

  @Column({ nullable: false })
  currencySymbol: string;

  @Column({ nullable: false })
  awardDescription: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: false })
  price: number;

  @Column({ nullable: false })
  available: number;

  @Column({ nullable: false })
  sold: number;

  @Column({ nullable: true })
  assignedPerUser: number;

  @Column({ nullable: false })
  startDate: Date;

  @Column({ nullable: false })
  endDate: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  allowExternalParticipants: boolean;

  @Column({ type: 'uuid', nullable: true })
  winner: string

  @Column()
  drawDate: Date;

  @Column({ type: 'enum', enum: RaffleStatusReference, nullable: false })
  status: RaffleStatusReference = RaffleStatusReference.CREATED;

  @Column({ type: 'uuid', nullable: false })
  institution_id: string;

  @Column({ type: 'uuid', nullable: false })
  institution_department_id: string;

  @Column({ type: 'uuid', nullable: false })
  organizer_id: string;

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

  @OneToOne(() => RaffleSerie, (raffleSerie) => raffleSerie.raffle, { cascade: true })
  raffleSerie: RaffleSerie;

  @ManyToOne(() => Institution, (institution) => institution.raffles)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @ManyToOne(() => InstitutionDepartment, (institutionDepartment) => institutionDepartment.raffles)
  @JoinColumn({ name: 'institution_department_id' })
  department: InstitutionDepartment;

  @ManyToOne(() => User, (user) => user.raffles)
  @JoinColumn({ name: 'organizer_id' })
  user: User;

  @OneToMany(() => RaffleImage, (raffleImage) => raffleImage.raffle, { cascade: true })
  raffleImages: RaffleImage[];

  @OneToMany(() => RaffleGiftImage, (raffleGiftImage) => raffleGiftImage.raffle, { cascade: true })
  raffleGiftImages: RaffleGiftImage[];

  @OneToMany(() => Ticket, (ticket) => ticket.raffle, { cascade: true })
  tickets: Ticket[];

  @OneToMany(() => Payment, (payment) => payment.raffle)
  payments: Payment[];

  static fromDto(raffleDto: RaffleDto, userId: string) {
    const raffle = new Raffle();

    raffle.title = raffleDto.title;
    raffle.description = raffleDto.description;
    raffle.currencyCode = raffleDto.currencyCode;
    raffle.currencySymbol = raffleDto.currencySymbol;
    raffle.awardDescription = raffleDto.awardDescription;
    raffle.price = raffleDto.price;
    raffle.available = raffleDto.available;
    raffle.sold = raffleDto.sold;
    raffle.assignedPerUser = raffleDto.assignedPerUser !== undefined ? raffleDto.assignedPerUser : 1;
    raffle.startDate = raffleDto.startDate;
    raffle.endDate = raffleDto.endDate;
    raffle.winner = raffleDto.winner;
    raffle.drawDate = raffleDto.drawDate;
    raffle.institution_id = raffleDto.institution_id;
    raffle.institution_department_id = raffleDto.institution_department_id;
    raffle.organizer_id = raffleDto.organizer_id;
    raffle.createdBy = userId;
    raffle.updatedBy = userId;

    if (raffleDto.allowExternalParticipants != undefined) raffle.allowExternalParticipants = raffleDto.allowExternalParticipants;
    if (raffleDto.status !== undefined) raffle.status = raffleDto.status as RaffleStatusReference;
    if (raffleDto.enabled !== undefined) raffle.enabled = raffleDto.enabled;

    if (raffleDto.raffleImages.length > 0) {
      raffle.raffleImages = [
        ...raffleDto.raffleImages.map((raffleImageDto) => RaffleImage.fromDto(raffleImageDto, userId))
      ]
    }

    if (raffleDto.raffleGiftImages.length > 0) {
      raffle.raffleGiftImages = [
        ...raffleDto.raffleGiftImages.map((raffleGiftImageDto) => RaffleGiftImage.fromDto(raffleGiftImageDto, userId))
      ]
    }

    raffle.raffleSerie = RaffleSerie.fromDto(raffleDto.available, userId);

    return raffle;
  }

  update(raffle: UpdateRaffleDto, userId: string) {
    Object.assign(this, raffle);

    this.updatedBy = userId;

    this.raffleImages = this.raffleImages.filter(r => r.id);
    this.raffleGiftImages = this.raffleGiftImages.filter(r => r.id);

    this.raffleImages.forEach((raffleImage) => {
      const raffleImageOp = raffle.raffleImages?.find((raffleImageOp) => raffleImageOp.id === raffleImage.id);
      if (!raffleImageOp) raffleImage.delete(userId);
    })

    this.raffleImages = [
      ...this.raffleImages,
      ...raffle.raffleImages!.filter((raffleImage) => !raffleImage.id).map((raffleImage) => RaffleImage.fromDto(raffleImage, userId))
    ]

    this.raffleGiftImages.forEach((raffleGiftImage) => {
      const raffleGiftImageOp = raffle.raffleGiftImages?.find((raffleGiftImageOp) => raffleGiftImageOp.id === raffleGiftImage.id);
      if (!raffleGiftImageOp) raffleGiftImage.delete(userId);
    })

    this.raffleGiftImages = [
      ...this.raffleGiftImages,
      ...raffle.raffleGiftImages!.filter((raffleGiftImage) => !raffleGiftImage.id).map((raffleGiftImage) => RaffleGiftImage.fromDto(raffleGiftImage, userId))
    ]
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;

    this.raffleImages.forEach((raffleImage) => { raffleImage.delete(userId) })
  }

  toDto() {
    const dto = new RaffleDto();
    dto.id = this.id;
    dto.title = this.title;
    dto.description = this.description;
    dto.currencyCode = this.currencyCode;
    dto.currencySymbol = this.currencySymbol;
    dto.awardDescription = this.awardDescription;
    dto.price = this.price;
    dto.available = this.available;
    dto.sold = this.sold;
    dto.assignedPerUser = this.assignedPerUser;
    dto.startDate = this.startDate;
    dto.endDate = this.endDate;
    dto.allowExternalParticipants = this.allowExternalParticipants;
    dto.winner = this.winner;
    dto.drawDate = this.drawDate;
    dto.status = RaffleStatusReference[this.status] as keyof typeof RaffleStatusReference;
    dto.enabled = this.enabled;
    dto.institution_id = this.institution_id;
    dto.institutionDescription = this.institution.description;
    dto.institution_department_id = this.institution_department_id;
    dto.institutionDepartmentDescription = this.department.description;
    dto.organizer_id = this.organizer_id;
    dto.organizerDescription = this.user.firstName + ' ' + this.user.lastName;

    if (this.raffleImages) dto.raffleImages = this.raffleImages?.map(ri => ri.toDto());
    if (this.raffleGiftImages) dto.raffleGiftImages = this.raffleGiftImages?.map(ri => ri.toDto());

    return dto;
  }
}