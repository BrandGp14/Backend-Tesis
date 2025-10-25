import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from 'src/institutes/entities/institute.entity';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {

    constructor(
        @InjectRepository(Institution)
        private readonly institutesRepository: Repository<Institution>,
        @InjectRepository(Raffle)
        private readonly rafflesRepository: Repository<Raffle>,
    ) { }

    async totalInstitutes() {
        return await this.institutesRepository.count({ where: { deleted: false } });
    }

    async totalRaffles() {
        return await this.rafflesRepository.count({ where: { enabled: true, deleted: false } });
    }

    async totalOrganizerRafflesTotal() {
        const result = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('institution.id', 'institution_id')
            .addSelect('institution.description', 'institutionDescription')
            .addSelect('COUNT(DISTINCT(raffle.organizer_id))', 'total')
            .leftJoinAndSelect('raffle.institution', 'institution')
            .where('raffle.enabled = true')
            .andWhere('raffle.deleted = false')
            .groupBy('institution_id')
            .addGroupBy('institutionDescription')
            .getRawMany();
        return result;
    }

    async totalOrganizerRafflesByMonth() {
        const result = await this.rafflesRepository.createQueryBuilder('raffle')
            .select("TO_CHAR(DATE_TRUNC('month', raffle.startDate), 'YYYY-MM-01')", 'date')
            .addSelect('institution.id', 'institution_id')
            .addSelect('institution.description', 'institutionDescription')
            .addSelect('COUNT(DISTINCT(raffle.organizer_id))', 'total')
            .leftJoinAndSelect('raffle.institution', 'institution')
            .where('raffle.enabled = true')
            .andWhere('raffle.deleted = false')
            .groupBy('date')
            .addGroupBy('institution_id')
            .addGroupBy('institutionDescription')
            .orderBy('date', 'ASC')
            .getRawMany();
        return result;
    }
}
