import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEmailLog, ReportType, EmailStatus } from '../entities/report-email-log.entity';
import { User } from '../../users/entities/user.entity';
import { ProfessorUserAssignment } from '../../professor-assignments/entities/professor-user-assignment.entity';
import { EmailSenderUtil } from '../../common/utils/email.sender.util';
import { EmailReportRequestDto, StudentRaffleReportResponseDto } from '../dto/student-raffle-report.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportEmailService {
  private readonly logger = new Logger(ReportEmailService.name);

  constructor(
    @InjectRepository(ReportEmailLog)
    private readonly emailLogRepository: Repository<ReportEmailLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProfessorUserAssignment)
    private readonly assignmentRepository: Repository<ProfessorUserAssignment>,
    private readonly emailSender: EmailSenderUtil
  ) {}

  async sendReportToOrganizer(
    emailRequest: EmailReportRequestDto,
    professorUserId: string
  ): Promise<{ success: boolean; emailLogId: string; message: string }> {
    
    this.logger.log(`Iniciando envío de reporte por email desde profesor ${professorUserId}`);

    try {
      // Verificar que el usuario tiene rol PROFESSOR
      const professorUser = await this.userRepository.findOne({
        where: { id: professorUserId },
        relations: ['userRoles', 'userRoles.role']
      });

      if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
        throw new NotFoundException('Profesor no encontrado');
      }

      // Obtener información del departamento desde assignments
      const assignment = await this.assignmentRepository.findOne({
        where: {
          userId: professorUserId,
          isActive: true,
          deleted: false
        },
        relations: ['department']
      });

      if (!assignment) {
        throw new NotFoundException('Profesor no tiene asignaciones activas');
      }

      // Verificar que el organizador existe
      const organizer = await this.userRepository.findOne({
        where: { id: emailRequest.organizerId }
      });

      if (!organizer) {
        throw new NotFoundException('Organizador no encontrado');
      }

      // Crear registro de log inicial
      const emailLog = ReportEmailLog.fromDto({
        professorId: professorUser.id,
        organizerId: emailRequest.organizerId,
        departmentId: assignment.departmentId,
        reportType: emailRequest.reportType,
        reportData: emailRequest.reportData,
        sentToEmail: organizer.email,
        emailSubject: emailRequest.subject || this.generateDefaultSubject(emailRequest.reportType, professorUser, assignment.department?.description),
        additionalMessage: emailRequest.additionalMessage,
        hasAttachment: emailRequest.attachPDF || true
      }, professorUserId);

      const savedEmailLog = await this.emailLogRepository.save(emailLog);

      // Generar contenido del email
      const emailBody = await this.generateEmailTemplate({
        reportData: emailRequest.reportData,
        professor: professorUser,
        organizer: organizer,
        additionalMessage: emailRequest.additionalMessage,
        reportType: emailRequest.reportType,
        departmentName: assignment.department?.description
      });

      // Preparar attachments
      let attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
      
      if (emailRequest.attachPDF) {
        try {
          const pdfContent = await this.generateReportPDF(emailRequest.reportData);
          attachments.push({
            filename: `reporte-rifas-${Date.now()}.pdf`,
            content: pdfContent,
            contentType: 'application/pdf'
          });
        } catch (pdfError) {
          this.logger.warn('Error generando PDF, enviando email sin adjunto', pdfError);
        }
      }

      // Enviar email
      const emailResult = await this.emailSender.sendEmail({
        to: organizer.email,
        subject: savedEmailLog.emailSubject,
        body: emailBody,
        isHtml: true,
        attachments: attachments
      });

      // Actualizar log según el resultado
      if (emailResult.success) {
        savedEmailLog.markAsSent();
        await this.emailLogRepository.save(savedEmailLog);
        
        this.logger.log(`Email enviado exitosamente a ${organizer.email} - Log ID: ${savedEmailLog.id}`);
        
        return {
          success: true,
          emailLogId: savedEmailLog.id,
          message: `Reporte enviado exitosamente a ${organizer.email}`
        };
      } else {
        savedEmailLog.markAsFailed(emailResult.message || 'Error desconocido');
        await this.emailLogRepository.save(savedEmailLog);
        
        this.logger.error(`Error enviando email: ${emailResult.message}`);
        
        return {
          success: false,
          emailLogId: savedEmailLog.id,
          message: `Error enviando email: ${emailResult.message}`
        };
      }

    } catch (error) {
      this.logger.error('Error en sendReportToOrganizer', error);
      throw error;
    }
  }

  async getEmailHistory(
    professorUserId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    
    // Verificar que el usuario tiene rol PROFESSOR
    const professorUser = await this.userRepository.findOne({
      where: { id: professorUserId },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new NotFoundException('Profesor no encontrado');
    }

    const queryBuilder = this.emailLogRepository
      .createQueryBuilder('emailLog')
      .leftJoinAndSelect('emailLog.professor', 'professor')
      .leftJoinAndSelect('emailLog.organizer', 'organizer')
      .leftJoinAndSelect('emailLog.department', 'department')
      .where('emailLog.professorId = :professorId', { professorId: professorUser.id });

    if (startDate) {
      queryBuilder.andWhere('emailLog.createdAt >= :startDate', {
        startDate: new Date(startDate)
      });
    }

    if (endDate) {
      queryBuilder.andWhere('emailLog.createdAt <= :endDate', {
        endDate: new Date(endDate)
      });
    }

    queryBuilder.orderBy('emailLog.createdAt', 'DESC');

    const emailLogs = await queryBuilder.getMany();

    return emailLogs.map(log => log.toDto());
  }

  async retryFailedEmail(emailLogId: string, professorUserId: string): Promise<{ success: boolean; message: string }> {
    
    const emailLog = await this.emailLogRepository.findOne({
      where: { id: emailLogId },
      relations: ['professor', 'organizer']
    });

    if (!emailLog) {
      throw new NotFoundException('Log de email no encontrado');
    }

    // Verificar que el usuario tiene rol PROFESSOR y permisos
    const professorUser = await this.userRepository.findOne({
      where: { id: professorUserId },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!professorUser || !professorUser.userRoles || !professorUser.userRoles.some(userRole => userRole.role.code === 'PROFESSOR')) {
      throw new NotFoundException('No tiene permisos para reintentar este email');
    }

    if (emailLog.professorId !== professorUserId) {
      throw new NotFoundException('No tiene permisos para reintentar este email');
    }

    if (!emailLog.canRetry()) {
      return {
        success: false,
        message: 'No se puede reintentar este email (máximo 3 intentos alcanzado)'
      };
    }

    emailLog.markAsRetrying();
    await this.emailLogRepository.save(emailLog);

    // Reintentar envío
    const reportData = emailLog.getParsedReportData();
    const emailResult = await this.emailSender.sendEmail({
      to: emailLog.sentToEmail,
      subject: emailLog.emailSubject,
      body: await this.generateEmailTemplate({
        reportData: reportData,
        professor: professorUser,
        organizer: emailLog.organizer,
        additionalMessage: emailLog.additionalMessage,
        reportType: emailLog.reportType,
        departmentName: emailLog.department?.description
      }),
      isHtml: true
    });

    if (emailResult.success) {
      emailLog.markAsSent();
      await this.emailLogRepository.save(emailLog);
      
      return {
        success: true,
        message: 'Email reenviado exitosamente'
      };
    } else {
      emailLog.markAsFailed(emailResult.message || 'Error en reintento');
      await this.emailLogRepository.save(emailLog);
      
      return {
        success: false,
        message: `Error en reintento: ${emailResult.message}`
      };
    }
  }

  private generateDefaultSubject(reportType: string, professor: User, departmentName?: string): string {
    const date = new Date().toLocaleDateString('es-PE');
    const professorName = `${professor.firstName} ${professor.lastName}`;
    const deptName = departmentName || 'Departamento';

    const typeLabels = {
      [ReportType.DAILY]: 'Diario',
      [ReportType.WEEKLY]: 'Semanal',
      [ReportType.MONTHLY]: 'Mensual',
      [ReportType.CUSTOM]: 'Personalizado',
      [ReportType.URGENT]: 'Urgente'
    };

    const typeLabel = typeLabels[reportType as ReportType] || 'Personalizado';

    return `📊 Reporte ${typeLabel} de Rifas - ${deptName} | ${professorName} - ${date}`;
  }

  private async generateEmailTemplate(params: {
    reportData: StudentRaffleReportResponseDto;
    professor: User;
    organizer: User;
    additionalMessage?: string;
    reportType: string;
    departmentName?: string;
  }): Promise<string> {
    
    const { reportData, professor, organizer, additionalMessage, reportType, departmentName } = params;

    // Template HTML del email
    const template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Rifas - WasiRifa</title>
    <style>
        .email-container { max-width: 700px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .stats-section { margin: 25px 0; }
        .stats-title { color: #374151; font-size: 18px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; margin: 0; }
        .stat-label { font-size: 12px; color: #6b7280; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .users-section { margin: 25px 0; }
        .user-item { background: #f9fafb; padding: 15px; margin: 8px 0; border-radius: 8px; border-left: 3px solid #10b981; }
        .user-name { font-weight: 600; color: #1f2937; margin-bottom: 4px; }
        .user-stats { font-size: 13px; color: #6b7280; }
        .user-stats span { margin-right: 12px; }
        .message-section { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6; }
        .message-title { color: #1e40af; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; }
        .message-content { color: #374151; line-height: 1.6; }
        .footer { background: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px; margin-top: 20px; border-radius: 8px; }
        .footer strong { color: white; }
        .period-info { background: #fef3c7; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 13px; color: #92400e; border-left: 3px solid #f59e0b; }
        .icon { margin-right: 8px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📊 Reporte de Rifas - WasiRifa</h1>
            <p>Generado por: ${professor.firstName} ${professor.lastName} | ${departmentName || reportData.professorInfo.department}</p>
            <p>${new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
            <div class="period-info">
                <strong>🗓️ Período del reporte:</strong> 
                ${reportData.reportPeriodStart ? new Date(reportData.reportPeriodStart).toLocaleDateString('es-PE') : 'Todos los tiempos'} - 
                ${reportData.reportPeriodEnd ? new Date(reportData.reportPeriodEnd).toLocaleDateString('es-PE') : 'Presente'}
            </div>

            <div class="stats-section">
                <h2 class="stats-title">
                    <span class="icon">📈</span>Estadísticas Generales
                </h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3 class="stat-value">${reportData.generalStatistics.totalUsers}</h3>
                        <p class="stat-label">Usuarios Monitoreados</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="stat-value">${reportData.generalStatistics.totalRaffles}</h3>
                        <p class="stat-label">Total de Rifas</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="stat-value">S/ ${reportData.generalStatistics.totalRevenue.toFixed(2)}</h3>
                        <p class="stat-label">Ingresos Totales</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="stat-value">${reportData.generalStatistics.totalTicketsSold}</h3>
                        <p class="stat-label">Tickets Vendidos</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="stat-value">${reportData.generalStatistics.overallOccupancyRate}%</h3>
                        <p class="stat-label">Tasa de Ocupación</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="stat-value">${reportData.generalStatistics.averageRafflesPerUser}</h3>
                        <p class="stat-label">Promedio Rifas/Usuario</p>
                    </div>
                </div>
            </div>

            <div class="users-section">
                <h2 class="stats-title">
                    <span class="icon">👥</span>Detalle por Usuario (Top Performers)
                </h2>
                ${reportData.userDetails
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .slice(0, 10)
                  .map(user => `
                    <div class="user-item">
                        <div class="user-name">${user.userInfo.firstName} ${user.userInfo.lastName}</div>
                        <div class="user-stats">
                            <span><strong>Rifas:</strong> ${user.totalRaffles}</span>
                            <span><strong>Ingresos:</strong> S/ ${user.totalRevenue.toFixed(2)}</span>
                            <span><strong>Tickets:</strong> ${user.totalTicketsSold}</span>
                            <span><strong>Ocupación:</strong> ${user.averageOccupancyRate}%</span>
                        </div>
                    </div>
                  `).join('')}
                ${reportData.userDetails.length > 10 ? `
                    <div style="text-align: center; color: #6b7280; font-size: 13px; margin-top: 15px;">
                        ... y ${reportData.userDetails.length - 10} usuarios más (ver reporte completo en el adjunto)
                    </div>
                ` : ''}
            </div>
            
            ${additionalMessage ? `
                <div class="message-section">
                    <div class="message-title">
                        <span class="icon">📝</span>Mensaje del Profesor
                    </div>
                    <div class="message-content">${additionalMessage}</div>
                </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p><strong>WasiRifa - Sistema de Gestión de Rifas</strong></p>
            <p>Este reporte fue generado automáticamente el ${new Date().toLocaleString('es-PE')}</p>
            <p>Tipo de reporte: <strong>${reportType.toUpperCase()}</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return template;
  }

  private async generateReportPDF(reportData: StudentRaffleReportResponseDto): Promise<Buffer> {
    // Por ahora retornamos un buffer vacío como placeholder
    // En una implementación real, usarías una librería como puppeteer o jsPDF
    this.logger.log('Generando PDF del reporte...');
    
    // Placeholder - aquí irías la generación real del PDF
    const pdfContent = `Reporte PDF - ${reportData.generalStatistics.totalUsers} usuarios`;
    return Buffer.from(pdfContent, 'utf8');
  }
}