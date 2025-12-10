import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as QRCode from 'qrcode';
import * as htmlPdf from 'html-pdf-node';
import { EmailSenderUtil } from '../common/utils/email.sender.util';
import { 
  GenerateReceiptDto, 
  EmailReceiptDto, 
  ReceiptResponseDto,
  BuyerDto,
  RaffleInfoDto,
  PaymentInfoDto,
  InstitutionDto
} from './dto/receipt.dto';

@Injectable()
export class ReceiptService {
  private readonly templatesPath = join(process.cwd(), 'src', 'receipt', 'templates');

  constructor(
    private readonly emailSenderUtil: EmailSenderUtil,
  ) {}

  /**
   * Genera un comprobante PDF a partir de los datos proporcionados
   */
  async generateReceiptPDF(receiptData: GenerateReceiptDto): Promise<Buffer> {
    try {
      // Generar código QR si no se proporciona
      let qrCodeBase64 = receiptData.qrCode;
      if (!qrCodeBase64) {
        qrCodeBase64 = await this.generateQRCode(receiptData.receiptId, receiptData.tickets);
      }

      // Cargar template HTML
      const htmlTemplate = await this.loadHTMLTemplate();
      
      // Generar lista HTML de tickets
      const ticketsList = receiptData.tickets.map(ticket => 
        `<div class="ticket-number">${ticket}</div>`
      ).join('');

      // Preparar datos para el template
      const templateData = {
        ...receiptData,
        qrCode: qrCodeBase64,
        ticketsCount: receiptData.tickets.length,
        ticketsList: ticketsList,
        generatedDate: new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Reemplazar placeholders en el template
      const processedHTML = this.processHTMLTemplate(htmlTemplate, templateData);

      // Configuración para la generación del PDF
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      };

      // Generar PDF
      const pdfResult = await htmlPdf.generatePdf(
        { content: processedHTML }, 
        pdfOptions
      );

      return pdfResult as unknown as Buffer;
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      throw new InternalServerErrorException('Error al generar el comprobante PDF');
    }
  }

  /**
   * Genera un código QR para validación del comprobante
   */
  async generateQRCode(receiptId: string, tickets: string[]): Promise<string> {
    try {
      const qrData = {
        receiptId,
        tickets,
        timestamp: Date.now(),
        validator: 'WASIRIFA'
      };

      const qrString = JSON.stringify(qrData);
      const qrCodeBuffer = await QRCode.toBuffer(qrString, {
        margin: 1,
        color: {
          dark: '#667eea',
          light: '#FFFFFF'
        },
        width: 200
      });

      return qrCodeBuffer.toString('base64');
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new InternalServerErrorException('Error al generar código QR');
    }
  }

  /**
   * Envía el comprobante por email
   */
  async sendReceiptEmail(
    receiptData: GenerateReceiptDto, 
    emailData: EmailReceiptDto
  ): Promise<void> {
    try {
      // Generar PDF del comprobante
      const pdfBuffer = await this.generateReceiptPDF(receiptData);
      
      // Preparar el email
      const emailSubject = emailData.subject || 
        `Comprobante de Participación - Rifa ${receiptData.raffle.name}`;
      
      const emailHTML = this.generateEmailHTML(receiptData, emailData.message);

      // Enviar email con PDF adjunto
      await this.emailSenderUtil.sendEmail({
        to: emailData.email,
        subject: emailSubject,
        body: emailHTML,
        isHtml: true,
        attachments: [{
          filename: `comprobante-${receiptData.receiptId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
    } catch (error) {
      console.error('Error sending receipt email:', error);
      throw new InternalServerErrorException('Error al enviar comprobante por email');
    }
  }

  /**
   * Valida un código QR de comprobante
   */
  async validateReceiptQR(qrCode: string): Promise<any> {
    try {
      const qrData = JSON.parse(qrCode);
      
      // Validaciones básicas
      if (!qrData.receiptId || !qrData.tickets || !qrData.validator) {
        throw new BadRequestException('Código QR inválido');
      }

      if (qrData.validator !== 'WASIRIFA') {
        throw new BadRequestException('Código QR no corresponde a WasiRifa');
      }

      // Aquí se podría implementar validación adicional contra la base de datos
      // Por ejemplo, verificar que el receiptId existe y está activo

      return {
        valid: true,
        receiptId: qrData.receiptId,
        tickets: qrData.tickets,
        timestamp: new Date(qrData.timestamp),
        message: 'Comprobante válido'
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Código QR malformado o inválido');
    }
  }

  /**
   * Obtiene información de un comprobante por ID
   */
  async getReceiptInfo(receiptId: string): Promise<ReceiptResponseDto> {
    try {
      // En una implementación real, esto buscaría en la base de datos
      // Por ahora, retornamos información mock
      
      return {
        receiptId,
        downloadUrl: `/api/receipt/${receiptId}/download`,
        status: 'generated',
        generatedAt: new Date().toISOString(),
        fileSize: 0 // Se calcularía dinámicamente
      };
    } catch (error) {
      throw new BadRequestException('Comprobante no encontrado');
    }
  }

  /**
   * Carga el template HTML del comprobante
   */
  private async loadHTMLTemplate(): Promise<string> {
    try {
      const templatePath = join(this.templatesPath, 'receipt-template.html');
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error('Error loading HTML template:', error);
      throw new InternalServerErrorException('Error al cargar template del comprobante');
    }
  }

  /**
   * Procesa el template HTML reemplazando placeholders
   */
  private processHTMLTemplate(template: string, data: any): string {
    let processedHTML = template;

    // Reemplazar variables simples {{{variable}}}
    const simpleVariables = [
      'receiptId', 'institution.name', 'institution.logo',
      'raffle.name', 'raffle.prize', 'raffle.id', 'raffle.drawDate',
      'buyer.name', 'buyer.dni', 'buyer.email', 'buyer.phone',
      'payment.amount', 'payment.method', 'payment.date', 'payment.reference',
      'qrCode', 'generatedDate', 'ticketsCount', 'ticketsList'
    ];

    simpleVariables.forEach(variable => {
      const value = this.getNestedValue(data, variable) || '';
      const regex = new RegExp(`{{{${variable.replace('.', '\\.')}}}}`, 'g');
      processedHTML = processedHTML.replace(regex, String(value));
    });

    // Reemplazar condicionales {{#if variable}}...{{/if}}
    processedHTML = this.processConditionals(processedHTML, data);

    // Reemplazar loops {{#each array}}...{{/each}}
    processedHTML = this.processLoops(processedHTML, data);

    return processedHTML;
  }

  /**
   * Procesa condicionales en el template
   */
  private processConditionals(template: string, data: any): string {
    const conditionalRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;
    
    return template.replace(conditionalRegex, (match, condition, content) => {
      const value = this.getNestedValue(data, condition.trim());
      return value ? content : '';
    });
  }

  /**
   * Procesa loops en el template
   */
  private processLoops(template: string, data: any): string {
    const loopRegex = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
    
    return template.replace(loopRegex, (match, arrayName, content) => {
      const array = this.getNestedValue(data, arrayName.trim());
      if (!Array.isArray(array)) return '';

      return array.map((item, index) => {
        let itemContent = content;
        // Reemplazar {{this}} con el valor del item
        itemContent = itemContent.replace(/{{this}}/g, String(item));
        // Reemplazar {{@index}} con el índice
        itemContent = itemContent.replace(/{{@index}}/g, String(index));
        return itemContent;
      }).join('');
    });
  }

  /**
   * Obtiene el valor de una propiedad anidada usando dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Genera el HTML para el email del comprobante
   */
  private generateEmailHTML(receiptData: GenerateReceiptDto, customMessage?: string): string {
    const defaultMessage = customMessage || 
      'Tu participación en la rifa ha sido confirmada exitosamente.';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${receiptData.institution.name}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Comprobante de Participación</h2>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Estimado/a <strong>${receiptData.buyer.name}</strong>,
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            ${defaultMessage}
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Detalles de tu participación:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Rifa:</strong> ${receiptData.raffle.name}</li>
              <li style="margin-bottom: 10px;"><strong>Números:</strong> ${receiptData.tickets.join(', ')}</li>
              <li style="margin-bottom: 10px;"><strong>Sorteo:</strong> ${receiptData.raffle.drawDate}</li>
              <li style="margin-bottom: 10px;"><strong>Comprobante:</strong> #${receiptData.receiptId}</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Encuentra adjunto tu comprobante oficial en formato PDF. 
            Te recomendamos conservarlo hasta el día del sorteo.
          </p>
          
          <p style="font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
            Este correo fue generado automáticamente por WasiRifa.<br>
            Si tienes dudas, visita nuestra plataforma web o contacta al organizador.
          </p>
        </div>
      </div>
    `;
  }
}