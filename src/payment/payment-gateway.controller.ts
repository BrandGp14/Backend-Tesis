import { Controller, Post, Get, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { NiubizPaymentService } from './niubiz/niubiz-payment.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { PaymentRequestDto, PaymentConfirmationDto } from './dto/payment-request.dto';

@Controller('payment-gateway')
@ApiTags('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentService: NiubizPaymentService) {}

  @Post('initiate')
  @ApiOperation({ 
    summary: 'Initiate payment for reserved numbers',
    description: 'Starts the payment process for previously reserved raffle numbers using Yape, Plin, Transfer, or Card'
  })
  async initiatePayment(
    @Body() paymentRequest: PaymentRequestDto,
    @Query('authenticated') authenticated?: boolean,
    @Req() req?: { user: JwtDto }
  ) {
    // Si el usuario está autenticado, usar su ID
    const userId = (authenticated && req?.user) ? req.user.sub : undefined;
    
    const payment = await this.paymentService.initiatePayment(paymentRequest, userId);
    return ApiResponse.success(payment);
  }

  @Post('initiate-authenticated')
  @UseGuards(JwtAuthService)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Initiate payment for authenticated user',
    description: 'Starts the payment process for authenticated user with previously reserved numbers'
  })
  async initiatePaymentAuthenticated(
    @Body() paymentRequest: PaymentRequestDto,
    @Req() req: { user: JwtDto }
  ) {
    const payment = await this.paymentService.initiatePayment(paymentRequest, req.user.sub);
    return ApiResponse.success(payment);
  }

  @Get('status/:paymentId')
  @ApiOperation({ 
    summary: 'Get payment status',
    description: 'Retrieves the current status of a payment transaction'
  })
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentService.getPaymentStatus(paymentId);
    return ApiResponse.success(payment.toResponseDto());
  }

  @Post('confirm/:transactionId')
  @ApiOperation({ 
    summary: 'Confirm payment completion',
    description: 'Confirms that a payment has been completed successfully (used by webhooks or manual confirmation)'
  })
  async confirmPayment(
    @Param('transactionId') transactionId: string,
    @Body() confirmationData?: PaymentConfirmationDto
  ) {
    const transaction = await this.paymentService.confirmPayment(
      transactionId, 
      confirmationData
    );
    
    return ApiResponse.success({
      message: 'Pago confirmado exitosamente',
      transaction_id: transaction.transaction_id,
      payment_id: transaction.id,
      status: transaction.status,
      numbers: transaction.selected_numbers,
    });
  }

  @Get('methods')
  @ApiOperation({ 
    summary: 'Get available payment methods',
    description: 'Returns the list of available payment methods and their configurations'
  })
  async getPaymentMethods() {
    const methods = [
      {
        code: 'YAPE',
        name: 'Yape',
        description: 'Pago con código QR de Yape',
        icon: 'yape-icon.png',
        enabled: true,
        processing_time: 'Inmediato',
        fee: 0
      },
      {
        code: 'PLIN',
        name: 'Plin',
        description: 'Pago con código QR de Plin',
        icon: 'plin-icon.png',
        enabled: true,
        processing_time: 'Inmediato',
        fee: 0
      },
      {
        code: 'TRANSFER',
        name: 'Transferencia Bancaria',
        description: 'Transferencia a cuenta bancaria',
        icon: 'bank-icon.png',
        enabled: true,
        processing_time: '1-2 horas',
        fee: 0
      },
      {
        code: 'CARD',
        name: 'Tarjeta de Crédito/Débito',
        description: 'Pago con tarjeta Visa/MasterCard',
        icon: 'card-icon.png',
        enabled: true,
        processing_time: 'Inmediato',
        fee: 2.5 // 2.5% fee
      }
    ];

    return ApiResponse.success(methods);
  }

  @Get('qr/:paymentId')
  @ApiOperation({ 
    summary: 'Get QR code for payment',
    description: 'Returns the QR code image (base64) for Yape or Plin payments'
  })
  async getPaymentQR(@Param('paymentId') paymentId: string) {
    const payment = await this.paymentService.getPaymentStatus(paymentId);
    
    if (!payment.qr_code_data) {
      return ApiResponse.error('QR code no disponible para este método de pago', 400);
    }

    return ApiResponse.success({
      qr_code: payment.qr_code_data,
      payment_url: payment.payment_url,
      expires_at: payment.expires_at,
      amount: payment.total_amount,
      currency: payment.currency_code,
      transaction_id: payment.transaction_id
    });
  }

  @Post('cancel/:paymentId')
  @ApiOperation({ 
    summary: 'Cancel payment',
    description: 'Cancels a pending payment and releases reserved numbers'
  })
  async cancelPayment(@Param('paymentId') paymentId: string) {
    // TODO: Implementar cancelación de pago
    return ApiResponse.success({ message: 'Funcionalidad de cancelación en desarrollo' });
  }

  @Get('history')
  @UseGuards(JwtAuthService)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user payment history',
    description: 'Returns the payment history for the authenticated user'
  })
  async getPaymentHistory(@Req() req: { user: JwtDto }) {
    // TODO: Implementar historial de pagos
    return ApiResponse.success({ message: 'Historial de pagos en desarrollo' });
  }
}