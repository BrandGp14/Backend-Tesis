import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';

@Controller('dashboard')
@UseGuards(JwtAuthService)
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
}
