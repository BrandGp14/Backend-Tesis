import { PartialType } from '@nestjs/mapped-types';
import { RaffleDto } from './raffle.dto';

export class UpdateRaffleDto extends PartialType(RaffleDto) {}
