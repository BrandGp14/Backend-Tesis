import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
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
        type:  ApiResponse<any>,
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
        const notifications = await this.notificationService.search(page, size, req. user);
        return ApiResponse.success(notifications);
    }

    @Post()
    @ApiOkResponse({
        description:  'Enviar notificación',
        type: ApiResponse<any>,
    })
    async create(@Body() notificationDto: NotificationDto, @Req() req: { user: JwtDto }) {
        const notification = await this.notificationService.create(notificationDto, req.user);
        return ApiResponse.success(notification);
    }

    // ✅ CRÍTICO: Esta ruta DEBE ir ANTES de ': id/read'
    // Si va después, NestJS interpreta "mark-all" como un ID
    @Patch('mark-all/read')
    @ApiOkResponse({
        description: 'Marcar todas las notificaciones como leídas',
        type: ApiResponse<any>,
    })
    async markAllAsRead(@Req() req: { user: JwtDto }) {
        try {
            console.log('📥 [BACKEND] Mark all as read request from user:', req.user.sub);
            await this.notificationService.markAllAsRead(req. user);
            console.log('✅ [BACKEND] All notifications marked as read');
            return ApiResponse.success({ message: 'Todas las notificaciones marcadas como leídas' });
        } catch (error) {
            console.error('❌ [BACKEND] Error marking all as read:', error);
            throw error;
        }
    }

    // ✅ Esta ruta va DESPUÉS porque tiene parámetro dinámico
    @Patch(':id/read')
    @ApiOkResponse({
        description: 'Marcar notificación como leída',
        type: ApiResponse<any>,
    })
    async markAsRead(@Param('id') id: string, @Req() req: { user: JwtDto }) {
        try {
            console.log('📥 [BACKEND] Mark as read request for notification:', id);
            const notification = await this.notificationService. markAsRead(id, req. user);
            console.log('✅ [BACKEND] Notification marked as read');
            return ApiResponse.success(notification);
        } catch (error) {
            console.error('❌ [BACKEND] Error marking as read:', error);
            throw error;
        }
    }
}