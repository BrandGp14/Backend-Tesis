import { Injectable, BadRequestException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
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
   * Procesa pago con Yape a través de Niubiz
   */
  private async processYapePayment(transaction: PaymentTransaction): Promise<any> {
    const token = await this.niubizAuthService.getAccessToken();
    const baseUrl = this.configService.get<string>('NIUBIZ_BASE_URL', 'https://apitestenv.vnforapps.com');
    
    const yapeRequest: NiubizYapeRequest = {
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
      description: `Compra de números de rifa - ${transaction.selected_numbers.join(', ')}`,
      orderId: transaction.transaction_id,
      customerEmail: transaction.customer_email,
      customerName: transaction.customer_name,
      customerDocument: transaction.customer_document,
      customerPhone: transaction.customer_phone,
      expirationTime: 30, // 30 minutos
    };

    try {
      // Llamada al API de Niubiz para Yape (endpoint simulado)
      const response = await firstValueFrom(
        this.httpService.post<NiubizYapeResponse>(
          `${baseUrl}/api.ecommerce/v2/ecommerce/token/session/yape`,
          yapeRequest,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 15000,
          }
        )
      );

      return {
        transactionId: response.data.transactionId,
        qrCode: response.data.qrCode,
        paymentUrl: response.data.paymentUrl,
        amount: response.data.amount,
        currency: response.data.currency,
      };

    } catch (error) {
      this.logger.error('Error en API de Niubiz Yape', error);
      
      if (error.response?.status === 401) {
        // Token expirado, invalidar caché
        this.niubizAuthService.invalidateToken();
        throw new HttpException('Error de autenticación con la pasarela de pagos', HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException('Error al procesar pago con Yape', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Procesa pago con Plin (similar a Yape)
   */
  private async processPlintPayment(transaction: PaymentTransaction): Promise<any> {
    // Implementación similar a Yape pero con endpoint específico de Plin
    const token = await this.niubizAuthService.getAccessToken();
    const baseUrl = this.configService.get<string>('NIUBIZ_BASE_URL', 'https://apitestenv.vnforapps.com');
    
    // Por ahora retornamos datos simulados para Plin
    return {
      transactionId: `PLIN_${Date.now()}`,
      qrCode: this.generateMockQRCode('PLIN', Number(transaction.total_amount)),
      paymentUrl: `${baseUrl}/pay/plin/${transaction.transaction_id}`,
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
    };
  }

  /**
   * Procesa transferencia bancaria
   */
  private async processTransferPayment(transaction: PaymentTransaction): Promise<any> {
    // Para transferencias, proporcionamos datos de cuenta bancaria
    return {
      transactionId: `TRANSFER_${Date.now()}`,
      qrCode: null,
      paymentUrl: null,
      bankAccount: this.configService.get<string>('BANK_ACCOUNT_NUMBER', '123-456-789-012'),
      bankName: this.configService.get<string>('BANK_NAME', 'Banco de Pruebas'),
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
    };
  }

  /**
   * Procesa pago con tarjeta
   */
  private async processCardPayment(transaction: PaymentTransaction): Promise<any> {
    const token = await this.niubizAuthService.getAccessToken();
    const baseUrl = this.configService.get<string>('NIUBIZ_BASE_URL', 'https://apitestenv.vnforapps.com');
    
    // Para tarjetas, redirigimos a formulario de Niubiz
    return {
      transactionId: `CARD_${Date.now()}`,
      qrCode: null,
      paymentUrl: `${baseUrl}/pay/card/${transaction.transaction_id}`,
      amount: Number(transaction.total_amount),
      currency: transaction.currency_code,
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
   * Genera código QR simulado (en producción se usaría el real de Niubiz)
   */
  private generateMockQRCode(method: string, amount: number): string {
    const qrData = `${method}_PAYMENT_${amount}_${Date.now()}`;
    return Buffer.from(qrData).toString('base64');
  }
}