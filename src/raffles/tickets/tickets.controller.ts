import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { PageReference } from 'src/common/enum/page.reference';
import { TicketsService } from './tickets.service';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { TicketDto } from '../dto/ticket.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';

@Controller('tickets')
export class TicketsController {

    constructor(private readonly ticketsService: TicketsService) { }

    @Get('/search')
    @UseGuards(JwtAuthService)
    async search(
        @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
        @Query('enabled') enabled?: boolean,
        @Query('institution') institution?: string,
        @Query('organizer') organizer?: string,
        @Query('department') department?: string,
        @Query('code') code?: string,
        @Query('purchaseDate') purchaseDate?: Date,
        @Query('documentNumber') documentNumber?: string,
    ) {
        const tickets = await this.ticketsService.search(page, size, enabled, institution, organizer, department, code, purchaseDate, documentNumber);
        return ApiResponse.success(tickets);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const ticket = await this.ticketsService.findOne(id);
        if (!ticket) return ApiResponse.notFound('Ticket not found');
        return ApiResponse.success(ticket);
    }

    @Post('/create')
    @UseGuards(JwtAuthService)
    async create(@Body() createTicketDto: TicketDto, @Req() req: { user: JwtDto }) {
        const tickets = await this.ticketsService.createWhenLoggedUser(createTicketDto, req.user);
        if (!tickets) return ApiResponse.notFound('Raffle not found');
        return ApiResponse.success(tickets);
    }

    @Post('/create/anonymous')
    async createAnonymous(@Body() createTicketDto: TicketDto) {
        const tickets = await this.ticketsService.createWhenIsNotLoggedUser(createTicketDto);
        if (!tickets) return ApiResponse.notFound('Raffle not found');
        return ApiResponse.success(tickets);
    }
}
