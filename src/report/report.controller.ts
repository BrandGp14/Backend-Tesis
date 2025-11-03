import { Controller, Get, Header, Headers, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';

@Controller('report')
export class ReportController {

    constructor(
        private readonly reportService: ReportService,
    ) { }

    @Get('by/institution')
    async getReportByInstitution(
        @Headers('institution') institution: string,
        @Query('period') period: number,
        @Query('department') department: string,
        @Query('organizer') organizer: string,
        @Query('dateStart') dateStart: string,
        @Query('dateEnd') dateEnd: string,
    ) {
        const result = await this.reportService.getReportByInstitution(institution, period, department, organizer, dateStart, dateEnd);

        return ApiResponse.success(result);
    }
}
