export class CommonDashboardDto {
    dateFrom: Date;
    dateTo: Date;
    result: CommonResultDashboardDto[];
}

export class CommonResultDashboardDto {
    year: number;
    month: number;
    total: number;
    object: string;
}