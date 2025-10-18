import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty({ description: 'Indica si la petición fue exitosa', examples: [true, false] })
  success: boolean;
  @ApiProperty({ description: 'Código de respuesta', examples: [200, 400, 500, 404] })
  code: number;
  @ApiProperty({
    description: 'Fecha y hora de la respuesta',
    examples: ['2021-01-01T00:00:00.000Z'],
  })
  timestamp: string;
  @ApiProperty({ description: 'Zona horaria', examples: ['UTC'] })
  timezone: string;
  @ApiProperty({ description: 'Mensaje de respuesta', examples: ['OK', 'Not Found'] })
  message?: string;
  @ApiProperty({ description: 'Datos de la respuesta', type: Object })
  data?: T;

  constructor(success: boolean, code: number, message?: string, data?: T) {
    this.success = success;
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.timezone = 'UTC';
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, 200, 'OK', data);
  }

  static error<T>(message: string, code: number): ApiResponse<T> {
    return new ApiResponse<T>(true, code, message, undefined);
  }

  static notFound<T>(message: string): ApiResponse<T> {
    return new ApiResponse<T>(true, 404, message, undefined);
  }
}
