import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsEmail, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class BuyerDto {
  @ApiProperty({ description: 'Nombre completo del comprador' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email del comprador' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'DNI del comprador' })
  @IsString()
  dni: string;

  @ApiProperty({ description: 'Teléfono del comprador' })
  @IsString()
  phone: string;
}

export class RaffleInfoDto {
  @ApiProperty({ description: 'ID de la rifa' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Nombre de la rifa' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Premio principal de la rifa' })
  @IsString()
  prize: string;

  @ApiProperty({ description: 'Fecha del sorteo' })
  @IsString()
  drawDate: string;
}

export class PaymentInfoDto {
  @ApiProperty({ description: 'Monto total pagado' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Método de pago utilizado' })
  @IsString()
  method: string;

  @ApiProperty({ description: 'Fecha del pago' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Referencia de la transacción' })
  @IsString()
  reference: string;
}

export class InstitutionDto {
  @ApiProperty({ description: 'Nombre de la institución' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Logo de la institución', required: false })
  @IsOptional()
  @IsString()
  logo?: string;
}

export class GenerateReceiptDto {
  @ApiProperty({ description: 'ID único del comprobante' })
  @IsString()
  receiptId: string;

  @ApiProperty({ description: 'Información de la rifa', type: RaffleInfoDto })
  @ValidateNested()
  @Type(() => RaffleInfoDto)
  raffle: RaffleInfoDto;

  @ApiProperty({ description: 'Números de boletos comprados', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tickets: string[];

  @ApiProperty({ description: 'Información del comprador', type: BuyerDto })
  @ValidateNested()
  @Type(() => BuyerDto)
  buyer: BuyerDto;

  @ApiProperty({ description: 'Información del pago', type: PaymentInfoDto })
  @ValidateNested()
  @Type(() => PaymentInfoDto)
  payment: PaymentInfoDto;

  @ApiProperty({ description: 'Información de la institución', type: InstitutionDto })
  @ValidateNested()
  @Type(() => InstitutionDto)
  institution: InstitutionDto;

  @ApiProperty({ description: 'Código QR para validación', required: false })
  @IsOptional()
  @IsString()
  qrCode?: string;
}

export class EmailReceiptDto {
  @ApiProperty({ description: 'Email de destino' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Asunto del email', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Mensaje adicional', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class ReceiptResponseDto {
  @ApiProperty({ description: 'ID del comprobante' })
  receiptId: string;

  @ApiProperty({ description: 'URL para descargar el PDF' })
  downloadUrl: string;

  @ApiProperty({ description: 'Estado de generación' })
  status: string;

  @ApiProperty({ description: 'Fecha de generación' })
  generatedAt: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes' })
  fileSize: number;
}

export class SendReceiptEmailDto {
  @ApiProperty({ description: 'Datos del comprobante', type: GenerateReceiptDto })
  @ValidateNested()
  @Type(() => GenerateReceiptDto)
  receiptData: GenerateReceiptDto;

  @ApiProperty({ description: 'Datos del email', type: EmailReceiptDto })
  @ValidateNested()
  @Type(() => EmailReceiptDto)
  emailData: EmailReceiptDto;
}