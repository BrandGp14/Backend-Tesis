import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Raffle } from "./raffle.entity";
import { RaffleImageDto } from "../dto/raffle-image.dto";

@Entity('raffle_images')
@Index(['id', 'raffle_id'])
export class RaffleImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    imageUrl: string;

    @Column({ nullable: false })
    displayOrder: number;

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

    @ManyToOne(() => Raffle, (raffle) => raffle.raffleImages)
    @JoinColumn({ name: 'raffle_id' })
    raffle: Raffle;

    static fromDto(raffleImageDto: RaffleImageDto, userId: string) {
        const raffleImage = new RaffleImage();
        raffleImage.imageUrl = raffleImageDto.imageUrl;
        raffleImage.displayOrder = raffleImageDto.displayOrder;
        raffleImage.createdBy = userId;
        raffleImage.updatedBy = userId;
        return raffleImage;
    }

    delete(userId: string) {
        this.enabled = false;
        this.deleted = true;
        this.updatedBy = userId;
    }

    toDto(): RaffleImageDto {
        const dto = new RaffleImageDto();
        dto.id = this.id;
        dto.imageUrl = this.imageUrl;
        dto.displayOrder = this.displayOrder;
        dto.enabled = this.enabled;
        return dto;
    }
}