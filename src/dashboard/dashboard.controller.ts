import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@ApiTags('Dashboard')
@UseGuards(JwtAuthService, RolesGuard)
@ApiBearerAuth()
export class DashboardController {

    constructor(private readonly dashboardService: DashboardService) { }

    @Get('total/institutes')
    async totalInstitutes() {
        const totalInstitutes = await this.dashboardService.totalInstitutes();
        return ApiResponse.success(totalInstitutes);
    }

    @Get('total/organizer/enabled/by/institution')
    async totalOrganizerEnabled(@Headers('institution') institution: string) {
        const totalOrganizerEnabled = await this.dashboardService.totalOrganizerByInstitutionEnabled(institution);
        if (!totalOrganizerEnabled) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(totalOrganizerEnabled);
    }

    @Get('total/raffles/active/by/institution')
    async totalRafflesActive(@Headers('institution') institution: string) {
        const totalRafflesActive = await this.dashboardService.totalRafflesByInstitutionActive(institution);
        if (!totalRafflesActive) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(totalRafflesActive);
    }

    @Get('total/users/by/institution/role/student')
    async totalUsersByInstitutionRoleStudent(@Headers('institution') institution: string) {
        const totalUsersByInstitutionRoleStudent = await this.dashboardService.totalUsersByInstitutionRoleStudent(institution);
        if (!totalUsersByInstitutionRoleStudent) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(totalUsersByInstitutionRoleStudent);
    }

    @Get('total/payments/by/actual/month/and/institution')
    async totalPaymentsByActualMonthAndInstitution(@Headers('institution') institution: string) {
        const totalPaymentsByActualMonthAndInstitution = await this.dashboardService.totalPaymentsByActualMonthAndInstitution(institution);
        if (!totalPaymentsByActualMonthAndInstitution) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(totalPaymentsByActualMonthAndInstitution);
    }

    @Get('total/sales/by/department/and/institution')
    async getTotalSalesByDepartmentAndInstitution(@Headers('institution') institution: string) {
        const totalSalesByDepartmentAndInstitution = await this.dashboardService.getTotalSalesByDepartmentAndInstitution(institution);
        if (!totalSalesByDepartmentAndInstitution) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(totalSalesByDepartmentAndInstitution);
    }

    @Get('top/five/raffles/by/institution')
    async getTopFiveRafflesByInstitution(@Headers('institution') institution: string) {
        const topFiveRafflesByInstitution = await this.dashboardService.getTopFiveRafflesByInstitution(institution);
        if (!topFiveRafflesByInstitution) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(topFiveRafflesByInstitution);
    }

    @Get('raffles/expire/in/next/7/days/by/institution')
    async getRafflesExpireInNext7DaysByInstitution(@Headers('institution') institution: string) {
        const rafflesExpireInNext7DaysByInstitution = await this.dashboardService.getRafflesExpireInNext7Days(institution);
        if (!rafflesExpireInNext7DaysByInstitution) return ApiResponse.notFound('Institution Required');
        return ApiResponse.success(rafflesExpireInNext7DaysByInstitution);
    }

    @Get('superadmin/stats')
    @ApiOperation({ 
        summary: 'Obtiene estadísticas generales del sistema para SuperAdmin',
        description: 'Endpoint exclusivo para usuarios con rol ADMINSUPREMO' 
    })
    @Roles('ADMINSUPREMO')
    async getSuperAdminStats() {
        try {
            const stats = await this.dashboardService.getSuperAdminStats();
            return ApiResponse.success(stats);
        } catch (error) {
            return ApiResponse.error(error.message, 500);
        }
    }
}
