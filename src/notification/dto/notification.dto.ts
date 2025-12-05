import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, isEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Validate, ValidateNested } from "class-validator";
import { NotificationType } from "../type/notification.type";
import { Transform, Type } from "class-transformer";
import { NotificationStatus } from "../type/notification.status";

export class NotificationDto {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    from: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNotEmpty({ each: true })
    to: string[];

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsEnum(NotificationType)
    @Transform(
        ({ value }) => {
            if (typeof value !== 'string' && !NotificationType[value as keyof typeof NotificationType]) throw new Error('Invalid NotificationType');
            return NotificationType[value as keyof typeof NotificationType];
        },
        { toClassOnly: true }
    )
    type: NotificationType | keyof typeof NotificationType;

    @IsOptional()
    @IsEnum(NotificationStatus)
    @Transform(
        ({ value }) => {
            if (typeof value !== 'string' && !NotificationStatus[value as keyof typeof NotificationStatus]) throw new Error('Invalid NotificationStatus');
            return NotificationStatus[value as keyof typeof NotificationStatus];
        },
        { toClassOnly: true }
    )
    status: NotificationStatus | keyof typeof NotificationStatus = NotificationStatus.PENDING;

    @IsBoolean()
    @IsOptional()
    isHtml: boolean = false;

    @IsString()
    @IsOptional()
    error: string;
}