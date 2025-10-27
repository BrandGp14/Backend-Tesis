import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { PaymentDto } from './dto/payment.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Controller('payment')
export class PaymentController {

    constructor(private readonly paymentService: PaymentService) { }

    @Get('/search')
    @UseGuards(JwtAuthService)
    async search(
        @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
        @Query('enabled') enabled?: boolean,
        @Query('raffleId') raffleId?: string,
    ) {
        const payments = await this.paymentService.search(page, size, enabled, raffleId);

        return ApiResponse.success(payments);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const payment = await this.paymentService.findOne(id);
        if (!payment) return ApiResponse.notFound('Payment not found');
        return ApiResponse.success(payment);
    }

    @Post('/create')
    @UseGuards(JwtAuthService)
    async create(@Body() createPaymentDto: PaymentDto, @Req() req: { user: JwtDto }) {
        const payment = await this.paymentService.createWhenLoggedUser(createPaymentDto, req.user);
        if (!payment) return ApiResponse.error('Error when creating payment', 400);
        return ApiResponse.success(payment);
    }

    @Post('/create/anonymous')
    async createAnonymous(@Body() createPaymentDto: PaymentDto) {
        const payment = await this.paymentService.createWhenNotLoggedUser(createPaymentDto);
        if (!payment) return ApiResponse.error('Error when creating payment', 400);
        return ApiResponse.success(payment);
    }
}
