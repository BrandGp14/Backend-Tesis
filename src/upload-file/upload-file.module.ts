import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UploadFileController } from './upload-file.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [UploadFileService],
  controllers: [UploadFileController],
  exports: [UploadFileService],
})
export class UploadFileModule { }
