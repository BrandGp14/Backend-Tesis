import { IsString, IsNotEmpty, IsArray, IsNumber, IsEmail, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  YAPE = 'YAPE',
  PLIN = 'PLIN',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export class PaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  raffle_id: string;

  @IsArray()
  @IsNumber({}, { each: true })
  selected_numbers: number[];

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsEmail()
  customer_email: string;

  @IsString()
  @IsNotEmpty()
  customer_document: string;

  @IsString()
  @IsNotEmpty()
  customer_phone: string;

  @IsNumber()
  @Type(() => Number)
  total_amount: number;

  @IsString()
  @IsNotEmpty()
  currency_code: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}

export class YapePaymentDto {
  @IsString()
  @IsNotEmpty()
  qr_code: string;

  @IsString()
  @IsNotEmpty()
  payment_url: string;

  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  expiration_time?: string;
}

export class PaymentResponseDto {
  @IsString()
  @IsNotEmpty()
  payment_id: string;

  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  raffle_id: string;

  @IsArray()
  @IsNumber({}, { each: true })
  reserved_numbers: number[];

  @ValidateNested()
  @Type(() => YapePaymentDto)
  @IsOptional()
  yape_data?: YapePaymentDto;

  @IsString()
  @IsOptional()
  qr_image_base64?: string;

  @IsString()
  @IsOptional()
  payment_url?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class PaymentConfirmationDto {
  @IsString()
  @IsNotEmpty()
  payment_id: string;

  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  gateway_response?: string;

  @IsString()
  @IsOptional()
  failure_reason?: string;
}

export class PaymentStatusDto {
  @IsString()
  @IsNotEmpty()
  payment_id: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsNotEmpty()
  raffle_id: string;

  @IsArray()
  @IsNumber({}, { each: true })
  numbers: number[];

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsEmail()
  customer_email: string;

  @IsString()
  @IsNotEmpty()
  created_at: string;

  @IsString()
  @IsOptional()
  completed_at?: string;

  @IsString()
  @IsOptional()
  ticket_id?: string;

  @IsString()
  @IsOptional()
  receipt_url?: string;
}