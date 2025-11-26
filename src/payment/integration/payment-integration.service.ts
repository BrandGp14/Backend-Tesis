import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NiubizPaymentService } from '../niubiz/niubiz-payment.service';
import { RaffleNumbersService } from 'src/raffles/raffle-numbers/raffle-numbers.service';
import { TicketsService } from 'src/raffles/tickets/tickets.service';
import { PaymentTransaction } from '../entity/payment-transaction.entity';
import { PaymentRequestDto, PaymentStatus } from '../dto/payment-request.dto';
import { TicketDto } from 'src/raffles/dto/ticket.dto';

@Injectable()
export class PaymentIntegrationService {
  private readonly logger = new Logger(PaymentIntegrationService.name);

  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    private readonly niubizPaymentService: NiubizPaymentService,
    private readonly raffleNumbersService: RaffleNumbersService,
    private readonly ticketsService: TicketsService,
  ) {}

  /**
   * Flujo completo: Reserva números -> Inicia pago -> Procesa -> Genera tickets
   */
  async processCompletePaymentFlow(paymentRequest: PaymentRequestDto, userId?: string) {
    this.logger.log(`Iniciando flujo completo de pago para rifa ${paymentRequest.raffle_id}`);

    // 1. Verificar/Reservar números
    if (userId) {
      // Usuario autenticado - verificar que tiene los números reservados
      const reservedNumbers = await this.raffleNumbersService.getUserReservedNumbers(
        paymentRequest.raffle_id, 
        userId
      );
      
      const userNumbers = reservedNumbers.map(rn => rn.number);
      const requestedNumbers = paymentRequest.selected_numbers;
      
      const missingNumbers = requestedNumbers.filter(num => !userNumbers.includes(num));
      if (missingNumbers.length > 0) {
        throw new BadRequestException(
          `Debe reservar primero los números: ${missingNumbers.join(', ')}`
        );
      }
    } else {
      // Usuario no autenticado - reservar números directamente
      await this.raffleNumbersService.reserveNumbers({
        raffle_id: paymentRequest.raffle_id,
        numbers: paymentRequest.selected_numbers,
      }, paymentRequest.customer_document, 30);
    }

    // 2. Iniciar pago con Niubiz
    const paymentResponse = await this.niubizPaymentService.initiatePayment(
      paymentRequest, 
      userId
    );

    this.logger.log(`Pago iniciado: ${paymentResponse.transaction_id}`);
    return paymentResponse;
  }

  /**
   * Confirma pago y genera tickets automáticamente
   */
  async confirmAndGenerateTickets(transactionId: string) {
    this.logger.log(`Confirmando pago y generando tickets para: ${transactionId}`);

    // 1. Confirmar pago
    const transaction = await this.niubizPaymentService.confirmPayment(transactionId);
    
    if (transaction.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('El pago debe estar completado para generar tickets');
    }

    // 2. Crear tickets para cada número
    const tickets: TicketDto[] = [];
    
    for (const number of transaction.selected_numbers) {
      const ticketDto = new TicketDto();
      ticketDto.fullName = transaction.customer_name;
      ticketDto.email = transaction.customer_email;
      ticketDto.documentNumber = transaction.customer_document;
      ticketDto.numberPhone = Number(transaction.customer_phone);
      ticketDto.ticketCode = `N${number.toString().padStart(6, '0')}`; // N000001, N000002, etc.
      ticketDto.purchaseDate = new Date();
      ticketDto.price = Number(transaction.total_amount) / transaction.selected_numbers.length;
      ticketDto.totalWithTax = Number(transaction.total_amount);
      ticketDto.raffle_id = transaction.raffle_id;

      tickets.push(ticketDto);
    }

    // 3. Generar tickets en el sistema
    let createdTickets: TicketDto[] | undefined;
    
    if (transaction.user_id) {
      // Usuario autenticado - crear JwtDto completo
      const jwtDto = {
        sub: transaction.user_id,
        email: transaction.customer_email,
        role: 'customer', // Role por defecto para pagos
        role_id: 'customer-role-id',
        institution: 'default-institution'
      };
      
      // Modificar el primer ticket para incluir purchaseTotal
      const ticketWithTotal = { ...tickets[0], purchaseTotal: transaction.selected_numbers.length };
      createdTickets = await this.ticketsService.createWhenLoggedUser(ticketWithTotal, jwtDto);
    } else {
      // Usuario no autenticado
      const ticketWithTotal = { ...tickets[0], purchaseTotal: transaction.selected_numbers.length };
      createdTickets = await this.ticketsService.createWhenIsNotLoggedUser(ticketWithTotal);
    }

    if (!createdTickets) {
      throw new BadRequestException('Error al generar tickets');
    }

    // 4. Actualizar números como vendidos con el ID del ticket
    await this.raffleNumbersService.markNumbersAsSold(
      transaction.raffle_id,
      transaction.selected_numbers,
      createdTickets[0].id || 'PENDING_TICKET', // Usar ID del primer ticket
      transaction.user_id || transaction.customer_document
    );

    // Actualizar transacción con ID del ticket
    if (createdTickets[0].id) {
      transaction.setTicket(createdTickets[0].id);
      await this.paymentTransactionRepository.save(transaction);
    }

    this.logger.log(`Tickets generados exitosamente para transacción: ${transactionId}`);
    
    return {
      transaction,
      tickets: createdTickets,
      message: 'Pago confirmado y tickets generados exitosamente'
    };
  }

  /**
   * Obtiene el resumen completo de una transacción
   */
  async getTransactionSummary(transactionId: string) {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { transaction_id: transactionId, deleted: false },
      relations: ['raffle']
    });

    if (!transaction) {
      throw new BadRequestException('Transacción no encontrada');
    }

    // Obtener estado actual de los números
    const numbers = await this.raffleNumbersService.getRaffleNumbers(transaction.raffle_id);
    const transactionNumbers = numbers.numbers.filter(n => 
      transaction.selected_numbers.includes(n.number)
    );

    return {
      transaction: transaction.toResponseDto(),
      raffle: {
        id: transaction.raffle.id,
        title: transaction.raffle.title,
        description: transaction.raffle.description,
        price: transaction.raffle.price,
        currency: transaction.raffle.currencySymbol
      },
      numbers: transactionNumbers,
      status_summary: {
        is_completed: transaction.status === PaymentStatus.COMPLETED,
        is_pending: transaction.status === PaymentStatus.PENDING,
        is_expired: transaction.isExpired(),
        can_be_completed: transaction.canBeCompleted(),
        expires_at: transaction.expires_at
      }
    };
  }

  /**
   * Libera automáticamente reservas y pagos expirados
   */
  async cleanupExpiredTransactions() {
    this.logger.log('Iniciando limpieza de transacciones expiradas');

    // Buscar transacciones expiradas
    const expiredTransactions = await this.paymentTransactionRepository.find({
      where: [
        { status: PaymentStatus.PENDING, deleted: false },
        { status: PaymentStatus.PROCESSING, deleted: false }
      ]
    });

    let cleanedCount = 0;

    for (const transaction of expiredTransactions) {
      if (transaction.isExpired()) {
        // Marcar como expirado
        transaction.updateStatus(PaymentStatus.EXPIRED, 'system');
        
        // Liberar números reservados
        await this.raffleNumbersService.releaseExpiredReservations(transaction.raffle_id);
        
        await this.paymentTransactionRepository.save(transaction);
        cleanedCount++;
      }
    }

    this.logger.log(`Limpieza completada. ${cleanedCount} transacciones expiradas procesadas`);
    return cleanedCount;
  }
}