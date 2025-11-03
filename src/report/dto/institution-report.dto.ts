export class InstitutionReportDto {
    totalSales: number;
    totalSalesVersus: number;
    totalTicketSales: number;
    totalRaffles: number;
    totalRafflesEnabledAndStarted: number;
    totalRafflesFinished: number;
    totalAverageSalesPerRaffle: number;
    totalByDepartment: InstitutionGroupObjectReportDto[] = [];
    totalByOrganizer: InstitutionGroupObjectReportDto[] = [];
}

export class InstitutionGroupObjectReportDto {
    total: number;
    object: string;
}