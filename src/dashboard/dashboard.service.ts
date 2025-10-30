import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from 'src/institutes/entities/institute.entity';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CommonDashboardDto, CommonResultDashboardDto } from './dto/common-dashboard.dto';
import { RaffleStatusReference } from 'src/raffles/type/raffle.status.reference';

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

    async totalRafflesByInstitutionActive(institution: string) {
        if (!institution) return undefined;

        const statusTotal = [RaffleStatusReference.STARTED]
        const statusVersus = [RaffleStatusReference.FINISHED]

        const { total } = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('COUNT(DISTINCT(raffle.id))', 'total')
            .where('raffle.deleted = false')
            .andWhere('raffle.enabled = true')
            .andWhere('raffle.status in (:...status)', { status: statusTotal })
            .andWhere('raffle.institution_id = :institution', { institution })
            .getRawOne();

        const { versus } = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('COUNT(DISTINCT(raffle.id))', 'versus')
            .where('raffle.deleted = false')
            .andWhere('raffle.enabled = true')
            .andWhere('raffle.status in (:...status)', { status: statusVersus })
            .andWhere('raffle.institution_id = :institution', { institution })
            .getRawOne();

        const commonDashboard = new CommonDashboardDto();
        const result = new CommonResultDashboardDto();
        result.total = Number(total ?? 0);
        result.versus = Number(versus ?? 0);
        commonDashboard.result.push(result);

        return commonDashboard;
    }

    async totalUsersByInstitutionRoleStudent(institution: string) {
        if (!institution) return undefined;

        const { total } = await this.usersRepository.createQueryBuilder('user')
            .select('COUNT(DISTINCT(user.id))', 'total')
            .leftJoin('user.userRoles', 'userRole')
            .leftJoin('userRole.role', 'role')
            .where('user.deleted = false')
            .andWhere('user.enabled = true')
            .andWhere('LOWER(role.code) = :role', { role: 'student' })
            .andWhere('userRole.institution.id = :institution', { institution })
            .getRawOne();

        const { versus } = await this.usersRepository.createQueryBuilder('user')
            .select('COUNT(DISTINCT(user.id))', 'versus')
            .leftJoin('user.userRoles', 'userRole')
            .leftJoin('userRole.role', 'role')
            .where('user.deleted = false')
            .andWhere('user.enabled = false')
            .andWhere('LOWER(role.code) = :role', { role: 'student' })
            .andWhere('userRole.institution.id = :institution', { institution })
            .getRawOne();

        const commonDashboard = new CommonDashboardDto();
        const result = new CommonResultDashboardDto();
        result.total = Number(total ?? 0);
        result.versus = Number(versus ?? 0);
        commonDashboard.result.push(result);

        return commonDashboard;
    }
}
