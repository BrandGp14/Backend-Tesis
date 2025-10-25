import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Raffle } from "./raffle.entity";

@Entity('raffle_series')
@Index(['id', 'raffle_id'])
export class RaffleSerie {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    prefix: string;

    @Column({ nullable: false })
    correlative: number;

    @Column({ nullable: false })
    size: number;

    @Column({ nullable: false })
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

    @OneToOne(() => Raffle, (raffle) => raffle.raffleSerie)
    @JoinColumn({ name: 'raffle_id' })
    raffle: Raffle;

    static fromDto(size: number, userId: string) {
        const raffleSerie = new RaffleSerie();
        raffleSerie.prefix = 'N';
        raffleSerie.correlative = 0;
        raffleSerie.size = size;
        raffleSerie.createdBy = userId;
        raffleSerie.updatedBy = userId;
        return raffleSerie;
    }

    update(userId: string) {
        this.updatedBy = userId;
        this.correlative = this.correlative + 1;
    }

    getCode() {
        const afterLength = this.size.toFixed().length - (this.prefix + this.correlative).length;
        return this.prefix + (afterLength > 0 ? '0'.repeat(afterLength) : '') + this.correlative;
    }
}