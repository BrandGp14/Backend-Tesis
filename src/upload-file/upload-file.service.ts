import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { AxiosResponse } from 'axios';
import { Response } from 'express';
import FormData from 'form-data';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { FileUploadResponse } from 'src/common/dto/file-upload.response.dto';

@Injectable()
export class UploadFileService {
  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    const GO_FILE_TOKEN = this.configService.get<string>('GO_FILE_TOKEN');
    const GO_FILE_URL = this.configService.get<string>('GO_FILE_URL');

    if (!GO_FILE_TOKEN || !GO_FILE_URL) {
      throw new Error('Falta la configuración necesaria para subir archivos');
    }

    if (!file) return null;

    const { buffer, mimetype, originalname } = file;

    if (!(buffer instanceof Buffer)) throw new BadRequestException('Archivo inválido: sin buffer');

    const { v6: UUIDv6 } = await import('uuid');
    const uuid = UUIDv6() + UUIDv6() + originalname;

    const formData = new FormData();
    formData.append('file', buffer, {
      filename: uuid,
      contentType: mimetype,
    });

    const response = await firstValueFrom(
      this.httpService.post<FileUploadResponse>(GO_FILE_URL, formData, {
        headers: {
          Authorization: `Bearer ${GO_FILE_TOKEN}`,
        },
      }),
    );

    return encodeURI(
      `https://${response.data.data.servers[0]}.gofile.io/download/${response.data.data.id}/${response.data.data.name}`,
    );
  }

  async getFile(url: string, res: Response) {
    const GO_FILE_TOKEN = this.configService.get<string>('GO_FILE_TOKEN');

    try {
      const response: AxiosResponse<NodeJS.ReadableStream> = await lastValueFrom(
        this.httpService.get(url, {
          responseType: 'stream',
          headers: {
            Authorization: `Bearer ${GO_FILE_TOKEN}`,
          },
        }),
      );

      const urlSplit = url.split('/');
      const contentType: string =
        (response.headers['Content-Type'] as string) || 'application/octet-stream';
      const contentDisposition: string =
        (response.headers['Content-Disposition'] as string) ||
        'attachment; filename*=' + urlSplit[urlSplit.length - 1];

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);

      response.data.pipe(res);
    } catch (error: any) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : String(error);
      console.error('Error al transmitir archivo desde GoFile:', errorMessage);

      if (error instanceof AxiosError) {
        const statusCode =
          error.response?.status === 404 ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          error.response?.status === 404 ? 'Archivo no encontrado' : 'Error al obtener el archivo';

        res.status(statusCode).json(ApiResponse.error(message, statusCode));
      } else {
        res.status(500).json(ApiResponse.error('Error al obtener el archivo', 500));
      }
    }
  }
}
