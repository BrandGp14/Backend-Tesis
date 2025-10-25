import { Controller, Get, Post, Body, Param, Query, DefaultValuePipe, ParseIntPipe, UseGuards, Req, Delete, Patch, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RaffleDto } from './dto/raffle.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('raffles')
@ApiBearerAuth()
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) { }

  @Get('/search')
  @UseGuards(JwtAuthService)
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
    @Query('enabled') enabled?: boolean,
    @Query('institution') institution?: string,
    @Query('organizer') organizer?: string,
  ) {
    const raffles = await this.rafflesService.search(page, size, enabled, institution, organizer);

    return ApiResponse.success(raffles);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const raffle = await this.rafflesService.findOne(id);
    if (!raffle) return ApiResponse.notFound('Raffle not found');
    return ApiResponse.success(raffle);
  }

  @Post()
  @UseGuards(JwtAuthService)
  @UseInterceptors(FilesInterceptor('files'))
  async create(@UploadedFiles() files: Express.Multer.File[], @Body() createRaffleDto: RaffleDto, @Req() req: { user: JwtDto }) {
    const raffle = await this.rafflesService.create(files, createRaffleDto, req.user);
    return ApiResponse.success(raffle);
  }

  @Put(':id')
  @UseGuards(JwtAuthService)
  @UseInterceptors(FilesInterceptor('files'))
  async update(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Body() updateRaffleDto: RaffleDto, @Req() req: { user: JwtDto }) {
    const raffle = await this.rafflesService.update(id, files, updateRaffleDto, req.user);
    if (!raffle) return ApiResponse.notFound('Raffle not found');
    return ApiResponse.success(raffle);
  }

  @Delete(':id')
  @UseGuards(JwtAuthService)
  async remove(@Param('id') id: string, @Req() req: { user: JwtDto }) {
    const raffle = await this.rafflesService.remove(id, req.user);
    if (!raffle) return ApiResponse.notFound('Raffle not found');
    return ApiResponse.deleted()
  }
}