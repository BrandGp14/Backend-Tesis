import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from './common/dto/api.response.dto';

@Catch()
export class ApiExceptionResponseFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Maneja mensajes anidados de class-validator u otros errores
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        if (typeof resObj.message === 'string') {
          message = resObj.message;
        } else if (Array.isArray(resObj.message)) {
          message = (resObj.message as string[]).join(', ');
        } else if (typeof resObj.error === 'string') {
          message = resObj.error;
        } else if (typeof exception.message === 'string') {
          message = exception.message;
        } else {
          message = 'Unexpected error';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json(ApiResponse.error(message, status));
  }
}
