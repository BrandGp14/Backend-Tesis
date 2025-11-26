import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { PaymentMethod, PaymentStatus, PaymentRequestDto, PaymentResponseDto } from '../dto/payment-request.dto';
import { RaffleNumber } from 'src/raffles/entities/raffle-number.entity';

@Entity('payment_transactions')
@Index(['id', 'transaction_id', 'raffle_id', 'status', 'payment_method'])
@Index(['customer_email', 'customer_document'])
@Index(['createdAt', 'status'])
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  transaction_id: string;

  @Column({ type: 'uuid', nullable: false })
  raffle_id: string;

  @Column({ type: 'json', nullable: false })
  selected_numbers: number[];

  @Column({ 
    type: 'enum', 
    enum: PaymentMethod, 
    nullable: false 
  })
  payment_method: PaymentMethod;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  total_amount: number;

  @Column({ nullable: false })
  currency_code: string;

  @Column({ nullable: false })
  customer_name: string;

  @Column({ nullable: false })
  customer_email: string;

  @Column({ nullable: false })
  customer_document: string;

  @Column({ nullable: false })
  customer_phone: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'json', nullable: true })
  gateway_data: any;

  @Column({ type: 'text', nullable: true })
  gateway_transaction_id: string | null;

  @Column({ type: 'text', nullable: true })
  qr_code_data: string | null;

  @Column({ type: 'text', nullable: true })
  payment_url: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  ticket_id: string | null;

  @Column({ type: 'text', nullable: true })
  failure_reason: string | null;

  @Column({ type: 'json', nullable: true })
  receipt_data: any;

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

  @ManyToOne(() => Raffle)
  @JoinColumn({ name: 'raffle_id' })
  raffle: Raffle;

  static fromDto(dto: PaymentRequestDto, userId: string): PaymentTransaction {
    const transaction = new PaymentTransaction();
    
    transaction.transaction_id = this.generateTransactionId();
    transaction.raffle_id = dto.raffle_id;
    transaction.selected_numbers = dto.selected_numbers;
    transaction.payment_method = dto.payment_method;
    transaction.total_amount = dto.total_amount;
    transaction.currency_code = dto.currency_code;
    transaction.customer_name = dto.customer_name;
    transaction.customer_email = dto.customer_email;
    transaction.customer_document = dto.customer_document;
    transaction.customer_phone = dto.customer_phone;
    transaction.user_id = dto.user_id || null;
    transaction.createdBy = userId || dto.customer_document;
    transaction.updatedBy = userId || dto.customer_document;

    // Establecer expiración (30 minutos para pagos)
    transaction.expires_at = new Date(Date.now() + 30 * 60 * 1000);

    return transaction;
  }

  static generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `WR_${timestamp}_${randomPart}`.toUpperCase();
  }

  updateStatus(status: PaymentStatus, userId: string, gatewayData?: any): void {
    this.status = status;
    this.updatedBy = userId;
    
    if (gatewayData) {
      this.gateway_data = { ...this.gateway_data, ...gatewayData };
    }

    if (status === PaymentStatus.COMPLETED) {
      this.completed_at = new Date();
    }
  }

  setGatewayData(gatewayTransactionId: string, qrCode?: string, paymentUrl?: string): void {
    this.gateway_transaction_id = gatewayTransactionId;
    this.qr_code_data = qrCode || null;
    this.payment_url = paymentUrl || null;
  }

  setTicket(ticketId: string): void {
    this.ticket_id = ticketId;
  }

  setFailure(reason: string): void {
    this.failure_reason = reason;
    this.status = PaymentStatus.FAILED;
  }

  isExpired(): boolean {
    return this.expires_at ? new Date() > this.expires_at : false;
  }

  canBeCompleted(): boolean {
    return this.status === PaymentStatus.PENDING || this.status === PaymentStatus.PROCESSING;
  }

  toResponseDto(): PaymentResponseDto {
    const response = new PaymentResponseDto();
    
    response.payment_id = this.id;
    response.transaction_id = this.transaction_id;
    response.status = this.status;
    response.payment_method = this.payment_method;
    response.amount = Number(this.total_amount);
    response.currency = this.currency_code;
    response.raffle_id = this.raffle_id;
    response.reserved_numbers = this.selected_numbers;

    if (this.payment_method === PaymentMethod.YAPE && this.qr_code_data) {
      response.qr_image_base64 = this.qr_code_data;
      response.payment_url = this.payment_url || undefined;
    }

    if (this.status === PaymentStatus.PENDING) {
      response.message = 'Pago pendiente. Complete el pago escaneando el código QR.';
    } else if (this.status === PaymentStatus.COMPLETED) {
      response.message = 'Pago completado exitosamente.';
    } else if (this.status === PaymentStatus.FAILED) {
      response.message = this.failure_reason || 'El pago falló. Intente nuevamente.';
    }

    return response;
  }
}