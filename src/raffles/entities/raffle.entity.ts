import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { RaffleDto } from '../dto/raffle.dto';
import { UpdateRaffleDto } from '../dto/update-raffle.dto';
import { RaffleImage } from './rafle-image.entity';
import { Institution } from 'src/institutes/entities/institute.entity';
import { User } from 'src/users/entities/user.entity';
import { RaffleStatusReference } from '../type/raffle.status.reference';

@Entity('raffles')
@Index(['id', 'winner', 'institution_id'])
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

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: false })
  price: number;

  @Column({ nullable: false })
  available: number;

  @Column({ nullable: false })
  sold: number;

  @Column({ nullable: true })
  maxPerUser: number;

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

  @ManyToOne(() => Institution, (institution) => institution.raffles)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @ManyToOne(() => User, (user) => user.raffles)
  @JoinColumn({ name: 'organizer_id' })
  user: User;

  @OneToMany(() => RaffleImage, (raffleImage) => raffleImage.raffle, { cascade: true })
  raffleImages: RaffleImage[];

  static fromDto(raffleDto: RaffleDto, userId: string) {
    const raffle = new Raffle();

    raffle.title = raffleDto.title;
    raffle.description = raffleDto.description;
    raffle.currencyCode = raffleDto.currencyCode;
    raffle.currencySymbol = raffleDto.currencySymbol;
    raffle.price = raffleDto.price;
    raffle.available = raffleDto.available;
    raffle.sold = raffleDto.sold;
    raffle.maxPerUser = raffleDto.maxPerUser !== undefined ? raffleDto.maxPerUser : -1;
    raffle.startDate = raffleDto.startDate;
    raffle.endDate = raffleDto.endDate;
    raffle.winner = raffleDto.winner;
    raffle.drawDate = raffleDto.drawDate;
    raffle.institution_id = raffleDto.institution_id;
    raffle.organizer_id = raffleDto.organizer_id;
    raffle.createdBy = userId;
    raffle.updatedBy = userId;

    if (raffleDto.allowExternalParticipants != undefined) raffle.allowExternalParticipants = raffleDto.allowExternalParticipants;
    if (raffleDto.status !== undefined) raffle.status = raffleDto.status;
    if (raffleDto.enabled !== undefined) raffle.enabled = raffleDto.enabled;

    if (raffleDto.raffleImages.length > 0) {
      raffle.raffleImages = [
        ...raffleDto.raffleImages.map((raffleImageDto) => RaffleImage.fromDto(raffleImageDto, userId))
      ]
    }

    return raffle;
  }

  update(raffle: UpdateRaffleDto, userId: string) {
    Object.assign(this, raffle);

    this.updatedBy = userId;

    this.raffleImages.forEach((raffleImage) => {
      const raffleImageOp = raffle.raffleImages?.find((raffleImageOp) => raffleImageOp.id === raffleImage.id);
      if (!raffleImageOp) raffleImage.delete(userId);
    })

    this.raffleImages = [
      ...this.raffleImages,
      ...raffle.raffleImages!.filter((raffleImage) => !raffleImage.id).map((raffleImage) => RaffleImage.fromDto(raffleImage, userId))
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
    dto.price = this.price;
    dto.available = this.available;
    dto.sold = this.sold;
    dto.maxPerUser = this.maxPerUser;
    dto.startDate = this.startDate;
    dto.endDate = this.endDate;
    dto.allowExternalParticipants = this.allowExternalParticipants;
    dto.winner = this.winner;
    dto.drawDate = this.drawDate;
    dto.status = this.status;
    dto.enabled = this.enabled;
    dto.institution_id = this.institution_id;
    dto.institutionDescription = this.institution.description;
    dto.organizer_id = this.organizer_id;
    dto.organizerDescription = this.user.firstName + ' ' + this.user.lastName;

    if (this.raffleImages) dto.raffleImages = this.raffleImages?.map(ri => ri.toDto());
    return dto;
  }
}