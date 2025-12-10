import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InstitutionDepartment } from '../../institutes/entities/institution-department.entity';

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
  URGENT = 'URGENT'
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}

@Entity('report_email_logs')
@Index(['professorId', 'sentAt'])
@Index(['organizerId', 'status'])
@Index(['departmentId', 'reportType'])
export class ReportEmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  professorId: string;

  @Column()
  organizerId: string;

  @Column()
  departmentId: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.CUSTOM
  })
  reportType: ReportType;

  @Column('text')
  reportData: string;

  @Column()
  sentToEmail: string;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING
  })
  status: EmailStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  emailSubject: string;

  @Column({ type: 'text', nullable: true })
  additionalMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRetryAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  attachmentPath: string;

  @Column({ type: 'boolean', default: false })
  hasAttachment: boolean;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'professorId' })
  professor: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @ManyToOne(() => InstitutionDepartment, { eager: true })
  @JoinColumn({ name: 'departmentId' })
  department: InstitutionDepartment;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdBy: string;

  static fromDto(dto: any, creatorUserId: string): ReportEmailLog {
    const emailLog = new ReportEmailLog();
    emailLog.professorId = dto.professorId;
    emailLog.organizerId = dto.organizerId;
    emailLog.departmentId = dto.departmentId;
    emailLog.reportType = dto.reportType || ReportType.CUSTOM;
    emailLog.reportData = JSON.stringify(dto.reportData);
    emailLog.sentToEmail = dto.sentToEmail;
    emailLog.emailSubject = dto.emailSubject;
    emailLog.additionalMessage = dto.additionalMessage;
    emailLog.hasAttachment = dto.hasAttachment || false;
    emailLog.attachmentPath = dto.attachmentPath;
    emailLog.createdBy = creatorUserId;
    return emailLog;
  }

  markAsSent(): void {
    this.status = EmailStatus.SENT;
    this.sentAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.status = EmailStatus.FAILED;
    this.errorMessage = errorMessage;
  }

  markAsRetrying(): void {
    this.status = EmailStatus.RETRYING;
    this.retryCount += 1;
    this.lastRetryAt = new Date();
  }

  canRetry(): boolean {
    return this.status === EmailStatus.FAILED && this.retryCount < 3;
  }

  getParsedReportData(): any {
    try {
      return JSON.parse(this.reportData);
    } catch (error) {
      return {};
    }
  }

  toDto(): any {
    return {
      id: this.id,
      professorId: this.professorId,
      organizerId: this.organizerId,
      departmentId: this.departmentId,
      reportType: this.reportType,
      reportData: this.getParsedReportData(),
      sentToEmail: this.sentToEmail,
      status: this.status,
      errorMessage: this.errorMessage,
      emailSubject: this.emailSubject,
      additionalMessage: this.additionalMessage,
      retryCount: this.retryCount,
      lastRetryAt: this.lastRetryAt,
      sentAt: this.sentAt,
      hasAttachment: this.hasAttachment,
      attachmentPath: this.attachmentPath,
      professor: this.professor ? {
        id: this.professor.id,
        firstName: this.professor.firstName,
        lastName: this.professor.lastName,
        email: this.professor.email,
        specialization: 'Profesor' // Valor por defecto ya que User no tiene specialization
      } : null,
      organizer: this.organizer ? {
        id: this.organizer.id,
        firstName: this.organizer.firstName,
        lastName: this.organizer.lastName,
        email: this.organizer.email
      } : null,
      department: this.department ? {
        id: this.department.id,
        description: this.department.description
      } : null,
      createdAt: this.createdAt
    };
  }
}