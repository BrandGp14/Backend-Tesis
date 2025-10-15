import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raffle } from './entities/raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
  ) {}

  async findAll(): Promise<Raffle[]> {
    return this.raffleRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: string): Promise<Raffle> {
    const raffle = await this.raffleRepository.findOne({ where: { id } });
    if (!raffle) throw new NotFoundException(`Rifa con ID ${id} no encontrada`);
    return raffle;
  }

  async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    const raffle = this.raffleRepository.create({
      ...createRaffleDto,
      id: this.generateId(),
    });
    return await this.raffleRepository.save(raffle);
  }

  async update(id: string, updateRaffleDto: UpdateRaffleDto): Promise<Raffle> {
    await this.findOne(id); // throw si no existe
    await this.raffleRepository.update(id, updateRaffleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // throw si no existe
    await this.raffleRepository.delete(id);
  }

  private generateId(): string {
    return 'cmf' + Math.random().toString(36).substr(2, 15) + Date.now();
  }
}