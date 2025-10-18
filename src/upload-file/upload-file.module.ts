import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploadFileModule {}
