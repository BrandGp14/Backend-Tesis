import { Controller, Get, Post, Body, Param, Patch, Delete, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Get()
  async findAll() {
    const raffles = await this.rafflesService.findAll();
    return {
      message: 'Rifas obtenidas exitosamente',
      data: raffles,
      count: raffles.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const raffle = await this.rafflesService.findOne(id);
    return {
      message: 'Rifa encontrada',
      data: raffle,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async create(@Body() createRaffleDto: CreateRaffleDto) {
    const raffle = await this.rafflesService.create(createRaffleDto);
    return {
      message: 'Rifa creada exitosamente',
      data: raffle,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async update(@Param('id') id: string, @Body() updateRaffleDto: UpdateRaffleDto) {
    const raffle = await this.rafflesService.update(id, updateRaffleDto);
    return {
      message: 'Rifa actualizada exitosamente',
      data: raffle,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.rafflesService.remove(id);
    return;
  }
}