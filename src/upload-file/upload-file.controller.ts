import { Controller, Get, Query, Res } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import express from 'express';

@Controller('file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Get()
  async getFile(@Query('url') url: string, @Res() response: express.Response) {
    return await this.uploadFileService.getFile(url, response);
  }
}
