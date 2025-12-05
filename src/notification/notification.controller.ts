import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { NotificationDto } from './dto/notification.dto';
import { PageReference } from 'src/common/enum/page.reference';

@Controller('notification')
@UseGuards(JwtAuthService)
export class NotificationController {

    constructor(private readonly notificationService: NotificationService) { }

    @Get("/me")
    @ApiOkResponse({
        description: 'Obtener notificaciones del usuario actual',
        type: ApiResponse<any>,
    })
    async getMeNotifications(@Req() req: { user: JwtDto }) {
        const notifications = await this.notificationService.getNotifications(req.user);
        return ApiResponse.success(notifications);
    }

    @Get("/search/me")
    @ApiOkResponse({
        description: 'Buscar notificaciones',
        type: ApiResponse<any>,
    })
    async searchMe(
        @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number
    ) {
        const notifications = await this.notificationService.search(page, size);
        return ApiResponse.success(notifications);
    }

    @Get("/search")
    @ApiOkResponse({
        description: 'Buscar notificaciones',
        type: ApiResponse<any>,
    })
    async search(
        @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
        @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
        @Req() req: { user: JwtDto }
    ) {
        const notifications = await this.notificationService.search(page, size, req.user);
        return ApiResponse.success(notifications);
    }

    @Post()
    @ApiOkResponse({
        description: 'Enviar notificación',
        type: ApiResponse<any>,
    })
    async create(@Body() notificationDto: NotificationDto, @Req() req: { user: JwtDto }) {
        const notification = await this.notificationService.create(notificationDto, req.user);
        return ApiResponse.success(notification);
    }
}
