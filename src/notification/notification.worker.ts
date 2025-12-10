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
        this.logger.log('🔄 Starting notification worker');

        if (this.isRunning) {
            this.logger.log('⚠️ Worker already running, skipping...');
            return;
        }

        this.isRunning = true;

        try {
            this.logger.log('📥 Fetching pending email notifications');
            // Usar query builder para mejor rendimiento y timeout
            const notifications = await this.notificationRepository
                .createQueryBuilder('notification')
                .where('notification.type = :type', { type: NotificationType.EMAIL })
                .andWhere('notification.status = :status', { status: NotificationStatus.PENDING })
                .andWhere('notification.deleted = :deleted', { deleted: false })
                .limit(10) // Limitar a 10 notificaciones por vez
                .getMany();

            this.logger.log(`📊 Found ${notifications.length} pending email notification(s)`);

            if (notifications.length === 0) {
                this.logger.log('✅ No pending emails to send');
                return;
            }

            this.logger.log(`Processing ${notifications.length} notifications`);

            // Procesar notificaciones de a una con manejo de errores
            for (const notification of notifications) {
                this.logger.log(`📧 Processing notification ${notification.id} to: ${notification.to}`);
                
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
                        this.logger.log(`✅ Email sent successfully for notification ${notification.id}`);
                    } else {
                        notification.status = NotificationStatus.ERROR;
                        notification.error = result.message || 'Unknown error';
                        this.logger.error(`❌ Failed to send email for notification ${notification.id}: ${result.message}`);
                    }
                } catch (error) {
                    this.logger.error(`❌ Exception sending email for notification ${notification.id}:`, error);
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

            this.logger.log(`✅ Successfully processed ${notifications.length} notification(s)`);
            
        } catch (e) {
            this.logger.error('❌ Error in notification worker:', e);
        } finally { 
            this.isRunning = false; 
            this.logger.log('🏁 Notification worker cycle completed');
        }
    }
}