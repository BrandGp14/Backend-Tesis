import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from 'src/institutes/entities/institute.entity';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CommonDashboardDto, CommonResultDashboardDto } from './dto/common-dashboard.dto';

@Injectable()
export class DashboardService {

    constructor(
        @InjectRepository(Institution)
        private readonly institutesRepository: Repository<Institution>,
        @InjectRepository(Raffle)
        private readonly rafflesRepository: Repository<Raffle>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async totalInstitutes() {
        return await this.institutesRepository.count({ where: { deleted: false } });
    }

    async totalOrganizerByInstitutionEnabled(institution: string) {

        if (!institution) return undefined;

        const { total } = await this.usersRepository.createQueryBuilder('user')
            .select('COUNT(DISTINCT(user.id))', 'total')
            .leftJoin('user.userRoles', 'userRole')
            .leftJoin('userRole.role', 'role')
            .where('user.deleted = false')
            .andWhere('user.enabled = true')
            .andWhere('LOWER(role.code) = :role', { role: 'organizer' })
            .andWhere('userRole.institution.id = :institution', { institution })
            .getRawOne();

        const { versus } = await this.usersRepository.createQueryBuilder('user')
            .select('COUNT(DISTINCT(user.id))', 'versus')
            .leftJoin('user.userRoles', 'userRole')
            .leftJoin('userRole.role', 'role')
            .where('user.deleted = false')
            .andWhere('LOWER(role.code) = :role', { role: 'organizer' })
            .andWhere('userRole.institution.id = :institution', { institution })
            .getRawOne();

        const commonDashboard = new CommonDashboardDto();
        const result = new CommonResultDashboardDto();
        result.total = Number(total ?? 0);
        result.versus = Number(versus ?? 0);
        commonDashboard.result.push(result);

        return commonDashboard;
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
