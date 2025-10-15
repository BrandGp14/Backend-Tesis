import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { Raffle } from './entities/raffle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Raffle])],
  controllers: [RafflesController],
  providers: [RafflesService],
  exports: [RafflesService],
})
export class RafflesModule {}