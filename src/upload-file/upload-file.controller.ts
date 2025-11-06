import { Controller, Get, Query, Res, Post, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from './upload-file.service';
import express from 'express';
import { ApiOkResponse, ApiProduces, ApiQuery, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { ApiResponse } from 'src/common/dto/api.response.dto';

@Controller('file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JwtAuthService)
  @ApiOperation({ summary: 'Subir archivo al servidor GoFile' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: JwtDto }
  ) {
    if (!file) {
      return ApiResponse.error('No se ha proporcionado ningún archivo', 400);
    }

    const url = await this.uploadFileService.uploadFile(file);
    return ApiResponse.success({ url });
  }

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
