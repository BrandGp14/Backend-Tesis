import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { RaffleNumbersService } from './raffle-numbers.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { ReserveNumbersDto } from '../dto/raffle-number.dto';

@Controller('raffle-numbers')
@ApiBearerAuth()
@ApiTags('raffle-numbers')
export class RaffleNumbersController {
  constructor(private readonly raffleNumbersService: RaffleNumbersService) {}

  @Get(':raffleId/availability')
  @ApiOperation({ 
    summary: 'Get all numbers and their availability for a raffle',
    description: 'Returns all numbers (1 to available) with their current status: AVAILABLE, RESERVED, or SOLD'
  })
  async getRaffleNumbers(@Param('raffleId') raffleId: string) {
    const numbers = await this.raffleNumbersService.getRaffleNumbers(raffleId);
    return ApiResponse.success(numbers);
  }

  @Get(':raffleId/available')
  @ApiOperation({ 
    summary: 'Get only available numbers for a raffle',
    description: 'Returns only the numbers that are currently available for purchase'
  })
  async getAvailableNumbers(@Param('raffleId') raffleId: string) {
    const numbers = await this.raffleNumbersService.getAvailableNumbers(raffleId);
    return ApiResponse.success(numbers);
  }

  @Post('reserve')
  @UseGuards(JwtAuthService)
  @ApiOperation({ 
    summary: 'Reserve specific numbers for a user',
    description: 'Reserves specified numbers for 15 minutes. Numbers will be automatically released if not purchased within the time limit.'
  })
  async reserveNumbers(
    @Body() reserveDto: ReserveNumbersDto, 
    @Req() req: { user: JwtDto },
    @Query('expirationMinutes') expirationMinutes?: number
  ) {
    const expiration = expirationMinutes || 15;
    const reservedNumbers = await this.raffleNumbersService.reserveNumbers(
      reserveDto, 
      req.user.sub, 
      expiration
    );
    return ApiResponse.success(reservedNumbers);
  }

  @Get(':raffleId/my-reservations')
  @UseGuards(JwtAuthService)
  @ApiOperation({ 
    summary: 'Get current user reserved numbers',
    description: 'Returns the numbers currently reserved by the authenticated user'
  })
  async getMyReservedNumbers(
    @Param('raffleId') raffleId: string,
    @Req() req: { user: JwtDto }
  ) {
    const numbers = await this.raffleNumbersService.getUserReservedNumbers(raffleId, req.user.sub);
    return ApiResponse.success(numbers);
  }

  @Post(':raffleId/release-expired')
  @ApiOperation({ 
    summary: 'Release expired reservations for a raffle',
    description: 'Manually triggers the release of expired number reservations. This is typically run automatically by a scheduled job.'
  })
  async releaseExpiredReservations(@Param('raffleId') raffleId: string) {
    const releasedCount = await this.raffleNumbersService.releaseExpiredReservations(raffleId);
    return ApiResponse.success({ 
      message: `${releasedCount} números liberados de reservas expiradas`,
      releasedCount 
    });
  }
}