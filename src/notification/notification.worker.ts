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

    @Cron(CronExpression.EVERY_MINUTE)
    async run() {
        this.logger.log('🔄 Starting notification worker');

        if (this.isRunning) {
            this.logger.log('⚠️ Worker already running, skipping.. .');
            return;
        }

        this.isRunning = true;

        try {
            this.logger.log('📥 Fetching pending email notifications');
            const notifications = await this.notificationRepository
                . find({ 
                    where: { 
                        type: NotificationType. EMAIL, 
                        status:  NotificationStatus.PENDING, 
                        deleted: false 
                    } 
                });

            this.logger.log(`📊 Found ${notifications.length} pending email notification(s)`);

            if (notifications.length === 0) {
                this.logger.log('✅ No pending emails to send');
                return;
            }

            for (const notification of notifications) {
                this.logger.log(`📧 Processing notification ${notification.id} to:  ${notification.to}`);
                
                try {
                    const result = await sendEmail({ 
                        to: notification.to.split(';'), 
                        subject: notification.subject, 
                        body: notification.message, 
                        isHtml: notification.isHtml 
                    });
                    
                    if (result.success) {
                        notification.status = NotificationStatus. COMPLETED;
                        notification.error = "";
                        this.logger.log(`✅ Email sent successfully for notification ${notification.id}`);
                    } else {
                        notification.status = NotificationStatus. ERROR;
                        notification.error = result.message;
                        this.logger.error(`❌ Failed to send email for notification ${notification.id}: ${result.message}`);
                    }
                } catch (error) {
                    notification.status = NotificationStatus.ERROR;
                    notification.error = error.message || 'Unknown error';
                    this.logger.error(`❌ Exception sending email for notification ${notification.id}:`, error);
                }

                notification.updatedAt = new Date();
            }

            this.logger.log('💾 Updating notification statuses in database');
            await this.notificationRepository.save(notifications);
            this.logger.log(`✅ Successfully processed ${notifications. length} notification(s)`);
            
        } catch (e) {
            this.logger.error('❌ Error in notification worker:', e);
        } finally { 
            this.isRunning = false; 
            this.logger.log('🏁 Notification worker cycle completed');
        }
    }
}