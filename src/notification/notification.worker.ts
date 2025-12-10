import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { Repository } from "typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { sendEmail } from "src/common/utils/email.sender.util";
import { NotificationType } from "./type/notification.type";
import { NotificationStatus } from "./type/notification.status";

@Injectable()
export class NotificationWorker {

    private logger = new Logger(NotificationWorker.name);
    private isRunning = false;

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES) // Cambiar a cada 5 minutos
    async run() {
        if (this.isRunning) {
            this.logger.log('Worker already running, skipping...');
            return;
        }

        this.isRunning = true;

        try {
            // Usar query builder para mejor rendimiento y timeout
            const notifications = await this.notificationRepository
                .createQueryBuilder('notification')
                .where('notification.type = :type', { type: NotificationType.EMAIL })
                .andWhere('notification.status = :status', { status: NotificationStatus.PENDING })
                .andWhere('notification.deleted = :deleted', { deleted: false })
                .limit(10) // Limitar a 10 notificaciones por vez
                .getMany();

            if (notifications.length === 0) {
                this.logger.log('No notifications to process');
                return;
            }

            this.logger.log(`Processing ${notifications.length} notifications`);

            // Procesar notificaciones de a una con manejo de errores
            for (const notification of notifications) {
                try {
                    const result = await Promise.race([
                        sendEmail({ 
                            to: notification.to.split(';'), 
                            subject: notification.subject, 
                            body: notification.message, 
                            isHtml: notification.isHtml 
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Email timeout')), 15000)
                        )
                    ]) as any;

                    if (result.success) {
                        notification.status = NotificationStatus.COMPLETED;
                        notification.error = "";
                    } else {
                        notification.status = NotificationStatus.ERROR;
                        notification.error = result.message || 'Unknown error';
                    }
                } catch (error) {
                    this.logger.error(`Failed to send email for notification ${notification.id}:`, error);
                    notification.status = NotificationStatus.ERROR;
                    notification.error = error.message || 'Email sending failed';
                }

                notification.updatedAt = new Date();
                
                // Guardar cada notificación individualmente para evitar transacciones largas
                try {
                    await this.notificationRepository.save(notification);
                } catch (error) {
                    this.logger.error(`Failed to save notification ${notification.id}:`, error);
                }
            }
            this.logger.log('Finished updating notifications');
        } catch (e) {
            this.logger.error(e);
        } finally { this.isRunning = false; }

    }
}