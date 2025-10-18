import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
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

    if (!file) throw new BadRequestException('Archivo inválido: archivo enviado');

    const { buffer, mimetype } = file;

    if (!(buffer instanceof Buffer)) throw new BadRequestException('Archivo inválido: sin buffer');

    const { v6: UUIDv6 } = await import('uuid');
    const uuid = UUIDv6() + UUIDv6();

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

    return `https://${response.data.data.servers[0]}.gofile.io/${response.data.data.parentFolderCode}/${response.data.data.id}/${response.data.data.name}`;
  }
}
