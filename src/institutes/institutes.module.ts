import { Module } from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { InstitutesController } from './institutes.controller';
import { Institution } from './entities/institute.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFileModule } from 'src/upload-file/upload-file.module';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';

@Module({
  imports: [EntitiesModuleModule, UploadFileModule],
  providers: [InstitutesService],
  controllers: [InstitutesController],
  exports: [],
})
export class InstitutesModule { }
