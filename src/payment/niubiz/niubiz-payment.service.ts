import { Injectable, BadRequestException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { NiubizAuthService } from './niubiz-auth.service';
import { PaymentTransaction } from '../entity/payment-transaction.entity';
import { PaymentRequestDto, PaymentResponseDto, PaymentMethod, PaymentStatus, YapePaymentDto } from '../dto/payment-request.dto';
import { RaffleNumbersService } from 'src/raffles/raffle-numbers/raffle-numbers.service';

interface NiubizYapeRequest {
  amount: number;
  currency: string;
  description: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  expirationTime: number; // minutos
}

interface NiubizYapeResponse {
  transactionId: string;
  orderId: string;
  qrCode: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: string;
  expirationTime: string;
}

@Injectable()
export class NiubizPaymentService {
  private readonly logger = new Logger(NiubizPaymentService.name);

  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    private readonly niubizAuthService: NiubizAuthService,
    private readonly raffleNumbersService: RaffleNumbersService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Inicia una transacción de pago con números reservados
   */
  async initiatePayment(paymentRequest: PaymentRequestDto, userId?: string): Promise<PaymentResponseDto> {
    this.logger.log(`Iniciando pago para rifa ${paymentRequest.raffle_id} con números [${paymentRequest.selected_numbers.join(', ')}]`);

    // Verificar que los números están reservados por el usuario
    if (userId) {
      await this.validateReservedNumbers(paymentRequest.raffle_id, paymentRequest.selected_numbers, userId);
    } else {
      // Para usuarios no logueados, reservar los números ahora
      await this.raffleNumbersService.reserveNumbers({
        raffle_id: paymentRequest.raffle_id,
        numbers: paymentRequest.selected_numbers,
      }, paymentRequest.customer_document, 30); // 30 minutos para completar pago
    }

    // Crear transacción en base de datos
    const transaction = PaymentTransaction.fromDto(paymentRequest, userId || paymentRequest.customer_document);
    const savedTransaction = await this.paymentTransactionRepository.save(transaction);

    try {
      // Procesar según método de pago
      let paymentData: any;
      
      switch (paymentRequest.payment_method) {
        case PaymentMethod.YAPE:
          paymentData = await this.processYapePayment(savedTransaction);
          break;
        
        case PaymentMethod.PLIN:
          paymentData = await this.processPlintPayment(savedTransaction);
          break;
          
        case PaymentMethod.TRANSFER:
          paymentData = await this.processTransferPayment(savedTransaction);
          break;
          
        case PaymentMethod.CARD:
          paymentData = await this.processCardPayment(savedTransaction);
          break;
          
        default:
          throw new BadRequestException('Método de pago no soportado');
      }

      // Actualizar transacción con datos de la pasarela
      savedTransaction.setGatewayData(
        paymentData.transactionId,
        paymentData.qrCode,
        paymentData.paymentUrl
      );
      savedTransaction.updateStatus(PaymentStatus.PENDING, userId || paymentRequest.customer_document);

      await this.paymentTransactionRepository.save(savedTransaction);

      this.logger.log(`Pago iniciado exitosamente: ${savedTransaction.transaction_id}`);
      return savedTransaction.toResponseDto();

    } catch (error) {
      this.logger.error('Error al procesar pago', error);
      
      // Liberar números reservados en caso de error
      await this.releaseReservedNumbers(paymentRequest.raffle_id, paymentRequest.selected_numbers);
      
      // Marcar transacción como fallida
      savedTransaction.setFailure(error.message);
      await this.paymentTransactionRepository.save(savedTransaction);

      throw error;
    }
  }

  /**
   * Procesa pago con Yape (SIMULADO)
   */
  private async processYapePayment(transaction: PaymentTransaction): Promise<any> {
    this.logger.log('🎯 Procesando pago YAPE simulado - Sin conexión externa - ACTUALIZADO');
    
    // Simular delay de procesamiento realista
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generar datos de pago simulados completamente locales
    const mockYapeData = {
      transactionId: `YAPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      qrCode: this.generateMockQRCode('YAPE', Number(transaction.total_amount)),
      paymentUrl: `mock://yape/pay/${transaction.transaction_id}`,
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
      instructions: `Para completar el pago:
1. Abre tu app Yape
2. Escanea el código QR o ingresa el monto: S/ ${transaction.total_amount}
3. Confirma el pago
4. Guarda el comprobante`,
    };
    
    this.logger.log(`✅ Pago YAPE simulado generado: ${mockYapeData.transactionId}`);
    return mockYapeData;
  }

  /**
   * Procesa pago con Plin (SIMULADO)
   */
  private async processPlintPayment(transaction: PaymentTransaction): Promise<any> {
    this.logger.log('🎯 Procesando pago PLIN simulado');
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      transactionId: `PLIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      qrCode: this.generateMockQRCode('PLIN', Number(transaction.total_amount)),
      paymentUrl: `mock://plin/pay/${transaction.transaction_id}`,
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
      instructions: `Para completar el pago con Plin:
1. Abre tu app Plin
2. Escanea el código QR o ingresa el monto: S/ ${transaction.total_amount}
3. Confirma el pago
4. Guarda el comprobante`,
    };
  }

  /**
   * Procesa transferencia bancaria (SIMULADO)
   */
  private async processTransferPayment(transaction: PaymentTransaction): Promise<any> {
    this.logger.log('🎯 Procesando transferencia bancaria simulada');
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      transactionId: `TRANSFER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      qrCode: null,
      paymentUrl: null,
      bankAccount: '194-123456789-012',
      bankName: 'Banco de Crédito del Perú (BCP)',
      bankAccountHolder: 'WasiRifa Perú SAC',
      accountType: 'Cuenta Corriente',
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
      instructions: `Para completar la transferencia:
1. Transfiere S/ ${transaction.total_amount} a la cuenta: 194-123456789-012
2. Banco: BCP - WasiRifa Perú SAC
3. Concepto: ${transaction.transaction_id}
4. Envía el comprobante de transferencia`,
    };
  }

  /**
   * Procesa pago con tarjeta (SIMULADO)
   */
  private async processCardPayment(transaction: PaymentTransaction): Promise<any> {
    this.logger.log('🎯 Procesando pago con tarjeta simulado');
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      qrCode: null,
      paymentUrl: `mock://card/pay/${transaction.transaction_id}`,
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
      instructions: `Pago con tarjeta - Simulación:
1. Ingresa los datos de tu tarjeta
2. Número: 4111 1111 1111 1111 (simulado)
3. CVV: 123
4. Fecha: 12/26
5. Confirma el pago`,
    };
  }

  /**
   * Confirma un pago (webhook o polling)
   */
  async confirmPayment(transactionId: string, gatewayData?: any): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { transaction_id: transactionId, deleted: false }
    });

    if (!transaction) {
      throw new BadRequestException('Transacción no encontrada');
    }

    if (!transaction.canBeCompleted()) {
      throw new BadRequestException('La transacción no puede ser completada');
    }

    // Marcar números como vendidos
    await this.raffleNumbersService.markNumbersAsSold(
      transaction.raffle_id,
      transaction.selected_numbers,
      'PENDING_TICKET', // Se actualizará cuando se cree el ticket
      transaction.user_id || transaction.customer_document
    );

    // Actualizar transacción
    transaction.updateStatus(PaymentStatus.COMPLETED, transaction.user_id || transaction.customer_document, gatewayData);
    
    return await this.paymentTransactionRepository.save(transaction);
  }

  /**
   * Obtiene el estado de un pago
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { id: paymentId, deleted: false },
      relations: ['raffle']
    });

    if (!transaction) {
      throw new BadRequestException('Pago no encontrado');
    }

    return transaction;
  }

  /**
   * Verifica que los números estén reservados por el usuario
   */
  private async validateReservedNumbers(raffleId: string, numbers: number[], userId: string): Promise<void> {
    const reservedNumbers = await this.raffleNumbersService.getUserReservedNumbers(raffleId, userId);
    const reservedNumbersList = reservedNumbers.map(rn => rn.number);

    const missingNumbers = numbers.filter(num => !reservedNumbersList.includes(num));
    
    if (missingNumbers.length > 0) {
      throw new BadRequestException(
        `Los siguientes números no están reservados por usted: ${missingNumbers.join(', ')}`
      );
    }
  }

  /**
   * Confirma un pago FORZADAMENTE sin validar reservas (SOLO SIMULACIÓN)
   */
  async forceConfirmPayment(transactionId: string, gatewayData?: any): Promise<PaymentTransaction> {
    this.logger.log(`🎯 CONFIRMACIÓN FORZADA de pago: ${transactionId}`);
    
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { transaction_id: transactionId, deleted: false }
    });

    if (!transaction) {
      throw new BadRequestException('Transacción no encontrada');
    }

    if (!transaction.canBeCompleted()) {
      throw new BadRequestException('La transacción no puede ser completada');
    }

    try {
      // Generar UUID válido para el ticket
      const simulatedTicketId = uuidv4();
      
      // Intentar marcar números como vendidos SIN validar reservas
      await this.raffleNumbersService.forceMarkNumbersAsSold(
        transaction.raffle_id,
        transaction.selected_numbers,
        simulatedTicketId,
        transaction.user_id || transaction.customer_document
      );
      
      this.logger.log(`✅ Números marcados como vendidos FORZADAMENTE: ${transaction.selected_numbers.join(', ')}`);
    } catch (error) {
      this.logger.error('Error al marcar números como vendidos forzadamente', error);
      // En simulación, continuamos aunque falle
    }

    // Actualizar transacción
    transaction.updateStatus(PaymentStatus.COMPLETED, transaction.user_id || transaction.customer_document, gatewayData);
    
    return await this.paymentTransactionRepository.save(transaction);
  }

  /**
   * Libera números reservados en caso de error
   */
  private async releaseReservedNumbers(raffleId: string, numbers: number[]): Promise<void> {
    try {
      await this.raffleNumbersService.releaseExpiredReservations(raffleId);
    } catch (error) {
      this.logger.error('Error al liberar números reservados', error);
    }
  }

  /**
   * Genera código QR simulado para demo
   */
  private generateMockQRCode(method: string, amount: number): string {
    // Generar una URL de QR code visual usando un servicio público
    const qrData = `${method}|MONTO:${amount}|TIME:${Date.now()}|DEMO_WASIRIFA`;
    const encodedData = encodeURIComponent(qrData);
    
    // Retornar URL del QR code que se puede mostrar como imagen
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
  }
}