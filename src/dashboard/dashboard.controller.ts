import { Controller, Get, UseGuards } from '@nestjs/common';
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

    @Get('total/raffles')
    async totalRaffles() {
        const totalRaffles = await this.dashboardService.totalRaffles();
        return ApiResponse.success(totalRaffles);
    }
}
