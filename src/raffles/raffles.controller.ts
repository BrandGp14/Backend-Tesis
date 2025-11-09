import { Controller, Get, Post, Body, Param, Query, DefaultValuePipe, ParseIntPipe, UseGuards, Req, Delete, Patch, Put, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RaffleDto } from './dto/raffle.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SearchRaffleDto } from './dto/search-raffle.dto';

@Controller('raffles')
@ApiBearerAuth()
@ApiTags('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) { }

  @Get('/search')
  @UseGuards(JwtAuthService)
  @ApiOperation({ 
    summary: 'Search raffles with filters and pagination',
    description: 'Get paginated list of raffles with optional filters for student dashboard'
  })
  async search(@Query() searchDto: SearchRaffleDto) {
    const raffles = await this.rafflesService.search(
      searchDto.page || 1,
      searchDto.size || 12,
      searchDto.enabled,
      searchDto.institution,
      searchDto.organizer,
      searchDto.department,
      searchDto.endDate ? new Date(searchDto.endDate) : undefined,
      searchDto.popularity,
      searchDto.title
    );

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

  @Get('search/me')
  @UseGuards(JwtAuthService)
  async searchMe(@Req() req: { user: JwtDto }) {
    const raffles = await this.rafflesService.searchMe(req.user);
    return ApiResponse.success(raffles);
  }
}