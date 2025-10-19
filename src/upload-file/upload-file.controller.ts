import { Controller, Get, Query, Res } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import express from 'express';
import { ApiOkResponse, ApiProduces, ApiQuery } from '@nestjs/swagger';

@Controller('file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Get()
  @ApiQuery({ name: 'url', required: true, type: String })
  @ApiOkResponse({
    description: 'Descarga el archivo subido al servidor GoFile',
    type: Response,
  })
  @ApiProduces('application/octet-stream')
  async getFile(@Query('url') url: string, @Res() response: express.Response) {
    return await this.uploadFileService.getFile(url, response);
  }
}
