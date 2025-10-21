import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { Raffle } from './entities/raffle.entity';
import { UploadFileModule } from 'src/upload-file/upload-file.module';

@Module({
  imports: [TypeOrmModule.forFeature([Raffle]), UploadFileModule],
  controllers: [RafflesController],
  providers: [RafflesService],
  exports: [RafflesService],
})
export class RafflesModule { }
