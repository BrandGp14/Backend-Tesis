import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber } from "class-validator";
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

    // ✅ CORRECCIÓN CRÍTICA:  Simplificar el transform para aceptar números
    @Transform(({ value }) => {
        // Si es número, devolverlo directamente
        if (typeof value === 'number') {
            return value;
        }
        
        // Si es string numérico, convertir a número
        if (typeof value === 'string' && !isNaN(Number(value))) {
            return Number(value);
        }
        
        // Si es string tipo "NOTIFICATION" o "EMAIL", mapear
        if (typeof value === 'string') {
            const mapping: Record<string, number> = {
                'NOTIFICATION': NotificationType.NOTIFICATION,
                'EMAIL': NotificationType.EMAIL,
            };
            if (mapping[value] !== undefined) {
                return mapping[value];
            }
        }
        
        // Si ya es un valor válido del enum, devolverlo
        if (Object.values(NotificationType).includes(value)) {
            return value;
        }
        
        throw new Error(`Invalid NotificationType: ${value}`);
    }, { toClassOnly: true })
    @Type(() => Number)
    @IsNumber()
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsOptional()
    @Transform(({ value }) => {
        // Si no hay valor, usar default
        if (value === undefined || value === null) {
            return NotificationStatus.PENDING;
        }
        
        // Si es número, devolverlo directamente
        if (typeof value === 'number') {
            return value;
        }
        
        // Si es string numérico, convertir a número
        if (typeof value === 'string' && !isNaN(Number(value))) {
            return Number(value);
        }
        
        // Si es string tipo "ERROR", "COMPLETED", "PENDING", mapear
        if (typeof value === 'string') {
            const mapping: Record<string, number> = {
                'ERROR':  NotificationStatus.ERROR,
                'COMPLETED': NotificationStatus. COMPLETED,
                'PENDING': NotificationStatus.PENDING,
            };
            if (mapping[value] !== undefined) {
                return mapping[value];
            }
        }
        
        // Si ya es un valor válido del enum, devolverlo
        if (Object.values(NotificationStatus).includes(value)) {
            return value;
        }
        
        throw new Error(`Invalid NotificationStatus: ${value}`);
    }, { toClassOnly: true })
    @Type(() => Number)
    @IsNumber()
    @IsEnum(NotificationStatus)
    status: NotificationStatus = NotificationStatus. PENDING;

    @IsBoolean()
    @IsOptional()
    isHtml: boolean = false;

    // ✅ NUEVO: Agregar campo read
    @IsBoolean()
    @IsOptional()
    read?: boolean;

    @IsString()
    @IsOptional()
    error: string;
}