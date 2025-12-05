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
        this.logger.log('Starting notification worker');

        if (this.isRunning) return;

        this.isRunning = true;

        try {
            this.logger.log('Fetching notifications');
            const notifications = await this.notificationRepository
                .find({ where: { type: NotificationType.EMAIL, status: NotificationStatus.PENDING, deleted: false, } });

            this.logger.log(`Found ${notifications.length} notifications`);

            for (const notification of notifications) {
                const result = await sendEmail({ to: notification.to.split(';'), subject: notification.subject, body: notification.message, isHtml: notification.isHtml });
                if (result.success) {
                    notification.status = NotificationStatus.COMPLETED;
                    notification.error = "";
                } else {
                    notification.status = NotificationStatus.ERROR;
                    notification.error = result.message;
                }

                notification.updatedAt = new Date();
            }

            this.logger.log('Updating notifications');
            await this.notificationRepository.save(notifications);
            this.logger.log('Finished updating notifications');
        } catch (e) {
            this.logger.error(e);
        } finally { this.isRunning = false; }

    }
}