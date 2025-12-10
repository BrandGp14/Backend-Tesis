import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Res, 
  HttpStatus, 
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ReceiptService } from './receipt.service';
import { 
  GenerateReceiptDto, 
  EmailReceiptDto, 
  ReceiptResponseDto,
  SendReceiptEmailDto 
} from './dto/receipt.dto';

@ApiTags('Comprobantes')
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('generate')
  @ApiOperation({ 
    summary: 'Generar comprobante PDF',
    description: 'Genera un comprobante en formato PDF a partir de los datos de compra proporcionados'
  })
  @ApiBody({ 
    type: GenerateReceiptDto,
    description: 'Datos necesarios para generar el comprobante'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comprobante generado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos para la generación del comprobante' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor al generar el comprobante' 
  })
  async generateReceipt(
    @Body() receiptData: GenerateReceiptDto,
    @Res() res: any
  ): Promise<void> {
    try {
      // Validaciones básicas
      if (!receiptData.tickets || receiptData.tickets.length === 0) {
        throw new BadRequestException('Debe incluir al menos un número de boleto');
      }

      if (!receiptData.buyer.name || !receiptData.buyer.email) {
        throw new BadRequestException('Información del comprador incompleta');
      }

      // Generar PDF
      const pdfBuffer = await this.receiptService.generateReceiptPDF(receiptData);
      
      // Configurar headers para descarga
      const filename = `comprobante-${receiptData.receiptId}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      // Enviar el PDF
      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in generateReceipt controller:', error);
      throw new InternalServerErrorException('Error al generar el comprobante');
    }
  }

  @Post('email')
  @ApiOperation({ 
    summary: 'Enviar comprobante por email',
    description: 'Genera y envía un comprobante en formato PDF al email especificado'
  })
  @ApiBody({ 
    type: SendReceiptEmailDto,
    description: 'Datos del comprobante y configuración del email'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comprobante enviado exitosamente por email'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email incorrecto' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error al enviar el email' 
  })
  async sendReceiptEmail(
    @Body() body: SendReceiptEmailDto
  ): Promise<{ message: string; emailSent: boolean }> {
    try {
      const { receiptData, emailData } = body;

      // Validaciones
      if (!receiptData || !emailData) {
        throw new BadRequestException('Faltan datos del comprobante o configuración del email');
      }

      if (!emailData.email) {
        throw new BadRequestException('Email de destino requerido');
      }

      // Enviar email
      await this.receiptService.sendReceiptEmail(receiptData, emailData);

      return {
        message: `Comprobante enviado exitosamente a ${emailData.email}`,
        emailSent: true
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in sendReceiptEmail controller:', error);
      throw new InternalServerErrorException('Error al enviar el comprobante por email');
    }
  }

  @Get(':receiptId')
  @ApiOperation({ 
    summary: 'Obtener información de comprobante',
    description: 'Obtiene la información básica de un comprobante por su ID'
  })
  @ApiParam({ 
    name: 'receiptId', 
    description: 'ID único del comprobante',
    example: 'receipt_123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del comprobante obtenida exitosamente',
    type: ReceiptResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Comprobante no encontrado' 
  })
  async getReceiptInfo(@Param('receiptId') receiptId: string): Promise<ReceiptResponseDto> {
    try {
      if (!receiptId || receiptId.trim().length === 0) {
        throw new BadRequestException('ID de comprobante requerido');
      }

      return await this.receiptService.getReceiptInfo(receiptId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in getReceiptInfo controller:', error);
      throw new InternalServerErrorException('Error al obtener información del comprobante');
    }
  }

  @Post('validate-qr')
  @ApiOperation({ 
    summary: 'Validar código QR de comprobante',
    description: 'Valida la autenticidad de un comprobante mediante su código QR'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        qrCode: {
          type: 'string',
          description: 'Datos del código QR a validar'
        }
      },
      required: ['qrCode']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código QR validado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Código QR inválido o malformado' 
  })
  async validateQR(
    @Body('qrCode') qrCode: string
  ): Promise<{ valid: boolean; receiptId?: string; tickets?: string[]; message: string }> {
    try {
      if (!qrCode || qrCode.trim().length === 0) {
        throw new BadRequestException('Código QR requerido');
      }

      const validationResult = await this.receiptService.validateReceiptQR(qrCode);
      
      return validationResult;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in validateQR controller:', error);
      throw new InternalServerErrorException('Error al validar el código QR');
    }
  }

  @Get('payment/:paymentId/download')
  @ApiOperation({ 
    summary: 'Descargar comprobante por ID de pago',
    description: 'Genera y descarga un comprobante basado en los datos de un pago específico'
  })
  @ApiParam({ 
    name: 'paymentId', 
    description: 'ID único del pago',
    example: 'payment_123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comprobante descargado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pago no encontrado' 
  })
  async downloadReceiptByPayment(
    @Param('paymentId') paymentId: string,
    @Res() res: any
  ): Promise<void> {
    try {
      // En una implementación real, aquí buscaríamos el pago en la base de datos
      // y construiríamos el receiptData a partir de los datos del pago
      
      // Por ahora, lanzamos un error indicando que está pendiente de implementación
      throw new BadRequestException('Funcionalidad pendiente de implementación completa con base de datos');
    } catch (error) {
      console.error('Error in downloadReceiptByPayment controller:', error);
      throw new InternalServerErrorException('Error al generar comprobante desde pago');
    }
  }

  @Post('qr-code')
  @ApiOperation({ 
    summary: 'Generar código QR para comprobante',
    description: 'Genera un código QR para validación de un comprobante específico'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receiptId: {
          type: 'string',
          description: 'ID del comprobante'
        },
        tickets: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de números de boletos'
        }
      },
      required: ['receiptId', 'tickets']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código QR generado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos insuficientes para generar el QR' 
  })
  async generateQRCode(
    @Body() body: { receiptId: string; tickets: string[] }
  ): Promise<{ qrCode: string; receiptId: string }> {
    try {
      const { receiptId, tickets } = body;

      if (!receiptId || !tickets || tickets.length === 0) {
        throw new BadRequestException('receiptId y tickets son requeridos');
      }

      const qrCode = await this.receiptService.generateQRCode(receiptId, tickets);

      return {
        qrCode,
        receiptId
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in generateQRCode controller:', error);
      throw new InternalServerErrorException('Error al generar código QR');
    }
  }
}