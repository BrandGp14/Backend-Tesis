import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { Repository } from 'typeorm';
import { InstitutionGroupObjectReportDto, InstitutionReportDto } from './dto/institution-report.dto';
import { RaffleStatusReference } from 'src/raffles/type/raffle.status.reference';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Raffle)
        private readonly rafflesRepository: Repository<Raffle>,
    ) { }

    async getReportByInstitution(institution: string, period?: number, department?: string, organizer?: string, dateStart?: String, dateEnd?: string) {
        let dateStartPeriod: Date | undefined, dateEndPeriod: Date | undefined, dateStartBeforePeriod: Date | undefined, dateEndBeforePeriod: Date | undefined;

        //period is months rest from dateStart
        if (period !== undefined) {
            dateEndPeriod = new Date()
            dateEndPeriod.setHours(23, 59, 59)

            dateStartPeriod = new Date(dateEndPeriod.getTime())
            dateStartPeriod.setMonth(dateStartPeriod.getMonth() - period)
            dateStartPeriod.setHours(0, 0, 0)

            dateEndBeforePeriod = new Date(dateStartPeriod.getTime())
            // date - 1 minute from dateStartPeriod
            dateEndBeforePeriod.setMinutes(dateEndBeforePeriod.getMinutes() - 1)
            dateEndBeforePeriod.setHours(23, 59, 59)

            dateStartBeforePeriod = new Date(dateEndBeforePeriod.getTime())
            dateStartBeforePeriod.setMonth(dateStartBeforePeriod.getMonth() - period)
            dateStartBeforePeriod.setHours(0, 0, 0)
        }

        const queryTotalSale = this.rafflesRepository.createQueryBuilder('raffle')
            .select('raffle.sold * raffle.price', 'totalSales')
            .where('raffle.institution_id = :institution', { institution })

        if (period) queryTotalSale.andWhere('raffle.startDate >= CAST(:dateStartPeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndPeriod AS TIMESTAMP)', { dateStartPeriod, dateEndPeriod })
        if (department) queryTotalSale.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) queryTotalSale.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) queryTotalSale.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) queryTotalSale.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const { totalSales } = await queryTotalSale.getRawOne() || { totalSales: 0 };

        const queryTotalSaleVersus = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('raffle.sold * raffle.price', 'totalSalesVersus')
            .where('raffle.institution_id = :institution', { institution })

        if (period) queryTotalSaleVersus.andWhere('raffle.startDate >= CAST(:dateStartBeforePeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndBeforePeriod AS TIMESTAMP)', { dateStartBeforePeriod, dateEndBeforePeriod })
        if (department) queryTotalSaleVersus.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) queryTotalSaleVersus.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) queryTotalSaleVersus.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) queryTotalSaleVersus.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const { totalSalesVersus } = await queryTotalSaleVersus.getRawOne() || { totalSalesVersus: 0 };

        const queryTotalTicketSold = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('SUM(raffle.sold)', 'totalTicketSold')
            .addSelect('COUNT(DISTINCT(raffle.id))', 'totalRaffles')
            .where('raffle.institution_id = :institution', { institution })

        if (period) queryTotalTicketSold.andWhere('raffle.startDate >= CAST(:dateStartPeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndPeriod AS TIMESTAMP)', { dateStartPeriod, dateEndPeriod })
        if (department) queryTotalTicketSold.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) queryTotalTicketSold.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) queryTotalTicketSold.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) queryTotalTicketSold.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const { totalTicketSold, totalRaffles } = await queryTotalTicketSold.getRawOne() || { totalTicketSold: 0, totalRaffles: 0 };

        const statusStart = [RaffleStatusReference.STARTED]
        const statusFinish = [RaffleStatusReference.FINISHED]

        const queryTotalRafflesEnabledAndStartedAndFinished = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('SUM(CASE WHEN raffle.status IN (:...statusStart) THEN 1 ELSE 0 END)', 'totalStart')
            .addSelect('SUM(CASE WHEN raffle.status IN (:...statusFinish) THEN 1 ELSE 0 END)', 'totalFinish')
            .setParameters({ statusStart, statusFinish })
            .where('raffle.institution_id = :institution', { institution })

        if (period) queryTotalRafflesEnabledAndStartedAndFinished.andWhere('raffle.startDate >= CAST(:dateStartPeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndPeriod AS TIMESTAMP)', { dateStartPeriod, dateEndPeriod })
        if (department) queryTotalRafflesEnabledAndStartedAndFinished.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) queryTotalRafflesEnabledAndStartedAndFinished.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) queryTotalRafflesEnabledAndStartedAndFinished.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) queryTotalRafflesEnabledAndStartedAndFinished.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const { totalStart, totalFinish } = await queryTotalRafflesEnabledAndStartedAndFinished.getRawOne() || { totalStart: 0, totalFinish: 0 };

        const queryTotalAverageSalesPerRaffle = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('SUM(raffle.sold * raffle.price) / COUNT(DISTINCT(raffle.id))', 'totalAverageSalesPerRaffle')
            .where('raffle.institution_id = :institution', { institution })

        if (period) queryTotalAverageSalesPerRaffle.andWhere('raffle.startDate >= CAST(:dateStartPeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndPeriod AS TIMESTAMP)', { dateStartPeriod, dateEndPeriod })
        if (department) queryTotalAverageSalesPerRaffle.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) queryTotalAverageSalesPerRaffle.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) queryTotalAverageSalesPerRaffle.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) queryTotalAverageSalesPerRaffle.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const { totalAverageSalesPerRaffle } = await queryTotalAverageSalesPerRaffle.getRawOne() || { totalAverageSalesPerRaffle: 0 };

        const distributionByDepartment = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('SUM(raffle.sold * raffle.price)', 'totalSales')
            .addSelect('department.description', 'department')
            .leftJoin('raffle.department', 'department')
            .where('raffle.institution_id = :institution', { institution })

        if (period) distributionByDepartment.andWhere('raffle.startDate >= CAST(:dateStartPeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndPeriod AS TIMESTAMP)', { dateStartPeriod, dateEndPeriod })
        if (department) distributionByDepartment.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) distributionByDepartment.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) distributionByDepartment.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) distributionByDepartment.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const totalSalesByDepartment = await distributionByDepartment
            .groupBy('raffle.institution_department_id')
            .addGroupBy('department.description')
            .getRawMany();

        const distributionByOrganizer = await this.rafflesRepository.createQueryBuilder('raffle')
            .select('SUM(raffle.sold * raffle.price)', 'totalSales')
            .addSelect('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .leftJoin('raffle.user', 'user')
            .where('raffle.institution_id = :institution', { institution })

        if (period) distributionByOrganizer.andWhere('raffle.startDate >= CAST(:dateStartPeriod AS TIMESTAMP) AND raffle.endDate <= CAST(:dateEndPeriod AS TIMESTAMP)', { dateStartPeriod, dateEndPeriod })
        if (department) distributionByOrganizer.andWhere('raffle.institution_department_id = :department', { department })
        if (organizer) distributionByOrganizer.andWhere('raffle.organizer_id = :organizer', { organizer })
        if (dateStart) distributionByOrganizer.andWhere('raffle.startDate >= CAST(:dateStart AS TIMESTAMP)', { dateStart })
        if (dateEnd) distributionByOrganizer.andWhere('raffle.endDate <= CAST(:dateEnd AS TIMESTAMP)', { dateEnd })

        const totalSalesByOrganizer = await distributionByOrganizer
            .groupBy('user.firstName')
            .addGroupBy('user.lastName')
            .getRawMany();

        const report = new InstitutionReportDto();
        report.totalSales = Number(totalSales);
        report.totalSalesVersus = Number(totalSalesVersus);
        report.totalTicketSales = Number(totalTicketSold);
        report.totalRaffles = Number(totalRaffles);
        report.totalRafflesEnabledAndStarted = Number(totalStart);
        report.totalRafflesFinished = Number(totalFinish);
        report.totalAverageSalesPerRaffle = Number(totalAverageSalesPerRaffle);

        totalSalesByDepartment?.forEach(({ totalSales, department }) => {
            const reportByDepartment = new InstitutionGroupObjectReportDto()
            reportByDepartment.total = Number(totalSales ?? 0);
            reportByDepartment.object = department;
            report.totalByDepartment.push(reportByDepartment);
        })

        totalSalesByOrganizer?.forEach(({ totalSales, firstName, lastName }) => {
            const reportByOrganizer = new InstitutionGroupObjectReportDto()
            reportByOrganizer.total = Number(totalSales ?? 0);
            reportByOrganizer.object = firstName + ' ' + lastName;
            report.totalByOrganizer.push(reportByOrganizer);
        })

        return report;
    }
}
