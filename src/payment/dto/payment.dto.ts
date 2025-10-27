import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsDefined, isDefined, IsNotEmpty, isNotEmptyObject, IsNumber, IsOptional, IsString } from "class-validator";
import { TicketDto } from "src/raffles/dto/ticket.dto";

export class PaymentDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsNotEmpty()
    gatewayPaymentId: string;

    @IsNumber()
    @IsNotEmpty()
    total: number;

    @IsNumber()
    @IsNotEmpty()
    totalWithTax: number;

    @IsString()
    @IsNotEmpty()
    currencyCode: string;

    @IsString()
    @IsNotEmpty()
    currencySymbol: string;

    @IsDateString()
    @IsNotEmpty()
    purchaseDate: Date;

    @IsString()
    @IsNotEmpty()
    raffle_id: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    enabled: boolean;

    @IsDefined()
    ticket: TicketDto;

    @IsArray()
    @IsOptional()
    @Type(() => TicketDto)
    tickets: TicketDto[];
}