import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Raffle } from "./raffle.entity";
import { RaffleGiftImageDto } from "../dto/rafle-gift-image.dto";

export class RaffleGiftImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    imageUrl: string;

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

    static fromDto(raffleGiftImageDto: RaffleGiftImageDto, userId: string) {
        const raffleGiftImage = new RaffleGiftImage();
        raffleGiftImage.imageUrl = raffleGiftImageDto.imageUrl;
        raffleGiftImage.createdBy = userId;
        raffleGiftImage.updatedBy = userId;
        return raffleGiftImage;
    }

    delete(userId: string) {
        this.enabled = false;
        this.deleted = true;
        this.updatedBy = userId;
    }

    toDto(): RaffleGiftImageDto {
        const dto = new RaffleGiftImageDto();
        dto.id = this.id;
        dto.imageUrl = this.imageUrl;
        dto.enabled = this.enabled;
        return dto;
    }
}