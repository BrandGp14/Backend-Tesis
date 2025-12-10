import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationDto } from './dto/notification.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';

@Injectable()
export class NotificationService {

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async getNotifications(user: JwtDto) {
        const notifications = await this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.deleted = false')
            .andWhere('notification.enabled = true')
            .andWhere(`notification.to LIKE :userId`, { userId: `%${user.sub}%` })
            .orderBy('notification.createdAt', 'DESC')
            .getMany();

        return notifications.map(n => n.toDto());
    }

    async search(page: number, size: number, user?:  JwtDto) {
        const skip = (page - 1) * size;

        const query = this.notificationRepository. createQueryBuilder('notification')
            .where('notification.deleted = false');

        if (user) query.andWhere('notification.from = :user', { user:  user.sub });

        const [notifications, totalElements] = await query
            .skip(skip)
            .take(size)
            .orderBy('notification.createdAt', 'DESC')
            .getManyAndCount();

        const totalPage = Math.ceil(totalElements / size);
        const last = page >= totalPage;

        return new PagedResponse<NotificationDto>(notifications. map(n => n.toDto()), page, size, totalPage, totalElements, last);
    }

    async create(dto: NotificationDto, user: JwtDto) {
        let notification = Notification.fromDto(dto, user. sub);
        notification.from = user.sub;
        notification = await this.notificationRepository.save(notification);
        return notification. toDto();
    }

    async markAsRead(id: string, user: JwtDto) {
        console.log('🔍 [SERVICE] Finding notification:', id);
        
        const notification = await this.notificationRepository.findOne({
            where: { id, deleted: false }
        });

        if (!notification) {
            console.error('❌ [SERVICE] Notification not found:', id);
            throw new NotFoundException('Notificación no encontrada');
        }

        console.log('📋 [SERVICE] Notification found.  Recipients:', notification.to);
        console.log('👤 [SERVICE] Current user:', user.sub);

        if (!notification.to.includes(user.sub)) {
            console.error('❌ [SERVICE] User not authorized');
            throw new NotFoundException('No tienes permiso para marcar esta notificación');
        }

        notification.read = true;
        notification.updatedBy = user.sub;

        await this.notificationRepository.save(notification);

        console.log(`✅ [SERVICE] Notification ${id} marked as read by user ${user.sub}`);

        return notification.toDto();
    }

    async markAllAsRead(user: JwtDto) {
        console.log('🔍 [SERVICE] Marking all notifications as read for user:', user.sub);
        
        try {
            const result = await this.notificationRepository
                .createQueryBuilder()
                .update(Notification)
                .set({ 
                    read: true, 
                    updatedBy:  user.sub,
                    updatedAt: new Date()
                })
                .where('deleted = false')
                .andWhere('enabled = true')
                .andWhere(`to LIKE :userId`, { userId: `%${user.sub}%` })
                .andWhere('read = false')
                .execute();

            console.log(`✅ [SERVICE] Marked ${result.affected || 0} notifications as read for user ${user.sub}`);

            return result;
        } catch (error) {
            console. error('❌ [SERVICE] Error in markAllAsRead:', error);
            throw error;
        }
    }

    // ✅ NUEVO: Eliminar notificación (soft delete)
    async deleteNotification(id: string, user: JwtDto) {
        console.log('🗑️ [SERVICE] Deleting notification:', id);
        
        const notification = await this.notificationRepository.findOne({
            where: { id, deleted: false }
        });

        if (!notification) {
            console.error('❌ [SERVICE] Notification not found:', id);
            throw new NotFoundException('Notificación no encontrada');
        }

        console.log('📋 [SERVICE] Notification found.  Recipients:', notification.to);
        console.log('👤 [SERVICE] Current user:', user.sub);

        if (!notification.to.includes(user.sub)) {
            console.error('❌ [SERVICE] User not authorized');
            throw new NotFoundException('No tienes permiso para eliminar esta notificación');
        }

        notification.deleted = true;
        notification.updatedBy = user.sub;
        await this.notificationRepository.save(notification);

        console.log(`✅ [SERVICE] Notification ${id} deleted by user ${user.sub}`);

        return { success: true, message: 'Notificación eliminada correctamente' };
    }

    // ✅ NUEVO:  Eliminar todas las notificaciones leídas
    async deleteAllRead(user: JwtDto) {
        console.log('🗑️ [SERVICE] Deleting all read notifications for user:', user.sub);

        const result = await this.notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ 
                deleted: true, 
                updatedBy: user.sub,
                updatedAt: new Date()
            })
            .where('deleted = false')
            .andWhere('enabled = true')
            .andWhere('read = true')
            .andWhere(`to LIKE :userId`, { userId: `%${user.sub}%` })
            .execute();

        console.log(`✅ [SERVICE] Deleted ${result.affected || 0} read notifications`);

        return { success: true, count: result.affected || 0 };
    }
}