import { Module } from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { InstitutesController } from './institutes.controller';
import { Institution } from './entities/institute.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFileModule } from 'src/upload-file/upload-file.module';

@Module({
  imports: [TypeOrmModule.forFeature([Institution]), UploadFileModule],
  providers: [InstitutesService],
  controllers: [InstitutesController],
  exports: [TypeOrmModule],
})
export class InstitutesModule { }
