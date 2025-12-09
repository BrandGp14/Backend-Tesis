import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NotificationType } from "../type/notification.type";
import { NotificationDto } from "../dto/notification.dto";
import { NotificationStatus } from "../type/notification.status";

@Entity('notifications')
@Index(['id', 'from', 'to'])
export class Notification {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    title: string;

    @Column()
    message: string;

    @Column()
    from: string;

    @Column({ type: 'text' })
    to: string;

    @Column()
    subject: string;

    @Column({ type: 'enum', enum: NotificationType, nullable: false })
    type: NotificationType = NotificationType.NOTIFICATION;

    @Column({ type:  'boolean', default: false })
    isHtml: boolean = false;

    @Column({ type: 'boolean', default: false })
    read: boolean = false;

    @Column({ type: 'enum', enum: NotificationStatus, nullable: false })
    status: NotificationStatus = NotificationStatus. PENDING;

    @Column({ type: 'text', nullable: true })
    error: string

    @Column({ type: 'boolean', default: true })
    enabled: boolean;

    @Column({ type: 'boolean', default: false })
    deleted: boolean;

    @Column()
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    updatedBy: string;

    @UpdateDateColumn()
    updatedAt: Date;

    static fromDto(notificationDto: NotificationDto, userId: string) {
        const notification = new Notification();
        notification.id = notificationDto.id;
        notification.title = notificationDto. title;
        notification.message = notificationDto.message;
        notification.from = notificationDto. from;
        notification.to = notificationDto.to. join(';');
        notification.subject = notificationDto.subject;
        notification.type = Number(notificationDto.type) as NotificationType;
        notification. isHtml = notificationDto.isHtml;
        notification.status = notificationDto.status || NotificationStatus.PENDING;
        notification.createdBy = userId;
        notification.updatedBy = userId;

        return notification;
    }

    toDto() {
        const dto = new NotificationDto();
        dto.id = this.id;
        dto.title = this.title;
        dto.message = this.message;
        dto.from = this.from;
        dto.to = this.to.split(';');
        dto.subject = this.subject;
        dto.type = this.type;
        dto.status = this.status;
        dto.isHtml = this.isHtml;
        
        // ✅ CRÍTICO: Agregar el campo read
        dto.read = this. read;
        
        return dto;
    }
}