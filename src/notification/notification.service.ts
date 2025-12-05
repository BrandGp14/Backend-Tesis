import { Injectable } from '@nestjs/common';
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
        const notifications = await this.notificationRepository.find({
            where: { deleted: false, to: user.sub },
            order: { createdAt: 'DESC' }
        });

        return notifications.map(n => n.toDto());
    }

    async search(page: number, size: number, user?: JwtDto) {
        const skip = (page - 1) * size;

        const query = this.notificationRepository.createQueryBuilder('notification')
            .where('notification.deleted = false');

        if (user) query.andWhere('notification.from = :user', { user: user.sub });

        const [notifications, totalElements] = await query
            .skip(skip)
            .take(size)
            .getManyAndCount();

        const totalPage = Math.ceil(totalElements / size);
        const last = page >= totalPage;

        return new PagedResponse<NotificationDto>(notifications.map(n => n.toDto()), page, size, totalPage, totalElements, last);
    }

    async create(dto: NotificationDto, user: JwtDto) {
        let notification = Notification.fromDto(dto, user.sub);
        notification.from = user.sub;
        notification = await this.notificationRepository.save(notification);
        return notification.toDto();
    }
}
