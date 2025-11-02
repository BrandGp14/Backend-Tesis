import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Institution } from 'src/institutes/entities/institute.entity';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CommonDashboardDto, CommonResultDashboardDto } from './dto/common-dashboard.dto';
import { RaffleStatusReference } from 'src/raffles/type/raffle.status.reference';
import { Payment } from 'src/payment/entity/payment.entity';

@Injectable()
export class DashboardService {

    constructor(
        @InjectRepository(Institution)
        private readonly institutesRepository: Repository<Institution>,
        @InjectRepository(Raffle)
        private readonly rafflesRepository: Repository<Raffle>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Payment)
        private readonly paymentsRepository: Repository<Payment>,
    ) { }

    async totalInstitutes() {
        return await this.institutesRepository.count({ where: { deleted: false } });
    }

    // Dashboard by institution Start

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

    async totalPaymentsByActualMonthAndInstitution(institution: string) {
        if (!institution) return undefined;

        const now = new Date();
        const monthWithDayOne = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthWithDayLast = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const lastMonthDayOne = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthDayLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const { total } = await this.paymentsRepository.createQueryBuilder('payment')
            .select('COUNT(DISTINCT(payment.id))', 'total')
            .leftJoin('payment.raffle', 'raffle')
            .where('payment.deleted = false')
            .andWhere('payment.enabled = true')
            .andWhere('raffle.institution_id = :institution', { institution })
            .andWhere('payment.purchaseDate BETWEEN :monthWithDayOne AND :monthWithDayLast', { monthWithDayOne, monthWithDayLast })
            .getRawOne();

        const { versus } = await this.paymentsRepository.createQueryBuilder('payment')
            .select('COUNT(DISTINCT(payment.id))', 'versus')
            .leftJoin('payment.raffle', 'raffle')
            .where('payment.deleted = false')
            .andWhere('payment.enabled = false')
            .andWhere('raffle.institution_id = :institution', { institution })
            .andWhere('payment.purchaseDate BETWEEN :lastMonthDayOne AND :lastMonthDayLast', { lastMonthDayOne, lastMonthDayLast })
            .getRawOne();

        const commonDashboard = new CommonDashboardDto();
        const result = new CommonResultDashboardDto();
        result.total = Number(total ?? 0);
        result.versus = Number(versus ?? 0);
        commonDashboard.result.push(result);

        return commonDashboard;
    }

    async getTotalSalesByDepartmentAndInstitution(institution: string) {
        if (!institution) return undefined;

        const result = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('COUNT(DISTINCT(raffle.id))', 'total')
            .addSelect('department.description', 'department')
            .leftJoin('raffle.department', 'department')
            .where('raffle.deleted = false')
            .andWhere('raffle.enabled = true')
            .andWhere('raffle.institution_id = :institution', { institution })
            .groupBy('department.description')
            .getRawMany();

        const commonDashboard = new CommonDashboardDto();
        result?.forEach(({ total, department }) => {
            const result = new CommonResultDashboardDto();
            result.total = Number(total ?? 0);
            result.object = department;
            commonDashboard.result.push(result);
        });

        return commonDashboard;
    }

    async getTopFiveRafflesByInstitution(institution: string) {
        if (!institution) return undefined;

        const result = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('COUNT(DISTINCT(raffle.id))', 'total')
            .addSelect('department.description', 'department')
            .leftJoin('raffle.department', 'department')
            .where('raffle.deleted = false')
            .andWhere('raffle.enabled = true')
            .andWhere('raffle.institution_id = :institution', { institution })
            .groupBy('department.description')
            .orderBy('total', 'DESC')
            .limit(5)
            .getRawMany();

        const commonDashboard = new CommonDashboardDto();
        result?.forEach(({ total, department }) => {
            const result = new CommonResultDashboardDto();
            result.total = Number(total ?? 0);
            result.object = department;
            commonDashboard.result.push(result);
        });

        return commonDashboard;
    }

    async getRafflesExpireInNext7Days(institution: string) {
        if (!institution) return undefined;

        const now = new Date();
        const nextSevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

        const result = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('raffle.title', 'title')
            .leftJoin('raffle.institution', 'institution')
            .where('raffle.deleted = false')
            .andWhere('raffle.enabled = true')
            .andWhere('raffle.institution_id = :institution', { institution })
            .andWhere('raffle.endDate < :nextSevenDays', { nextSevenDays })
            .getRawMany();

        const commonDashboard = new CommonDashboardDto();
        result?.forEach(({ title, endDate }) => {
            const result = new CommonResultDashboardDto();
            result.object = title;
            commonDashboard.result.push(result);
        });

        return commonDashboard;
    }

    // Dashboard by institution End
}
