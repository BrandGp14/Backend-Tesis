import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaffleNumber } from '../entities/raffle-number.entity';
import { RaffleNumberStatus } from '../enums/raffle-number-status.enum';
import { Raffle } from '../entities/raffle.entity';
import { RaffleNumberDto, ReserveNumbersDto, RaffleNumbersAvailabilityDto } from '../dto/raffle-number.dto';

@Injectable()
export class RaffleNumbersService {
  constructor(
    @InjectRepository(RaffleNumber)
    private readonly raffleNumberRepository: Repository<RaffleNumber>,
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
  ) {}

  /**
   * Obtiene todos los números de una rifa con su estado actual
   * @param raffleId ID de la rifa
   * @returns Lista de números con su disponibilidad
   */
  async getRaffleNumbers(raffleId: string): Promise<RaffleNumbersAvailabilityDto> {
    // Verificar que la rifa existe
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId, deleted: false }
    });

    if (!raffle) {
      throw new NotFoundException(`Rifa con ID ${raffleId} no encontrada`);
    }

    // Obtener todos los números de la rifa
    const numbers = await this.raffleNumberRepository.find({
      where: { 
        raffle_id: raffleId, 
        deleted: false 
      },
      order: { number: 'ASC' }
    });

    // Calcular estadísticas
    const stats = {
      available: 0,
      reserved: 0,
      sold: 0
    };

    numbers.forEach(num => {
      stats[num.status.toLowerCase()]++;
    });

    // Crear DTO de respuesta
    const response = new RaffleNumbersAvailabilityDto();
    response.raffle_id = raffleId;
    response.total_numbers = raffle.available;
    response.available_count = stats.available;
    response.reserved_count = stats.reserved;
    response.sold_count = stats.sold;
    response.numbers = numbers.map(num => num.toDto());

    return response;
  }

  /**
   * Obtiene solo los números disponibles de una rifa
   * @param raffleId ID de la rifa
   * @returns Lista de números disponibles
   */
  async getAvailableNumbers(raffleId: string): Promise<RaffleNumberDto[]> {
    const numbers = await this.raffleNumberRepository.find({
      where: { 
        raffle_id: raffleId, 
        status: RaffleNumberStatus.AVAILABLE,
        deleted: false 
      },
      order: { number: 'ASC' }
    });

    return numbers.map(num => num.toDto());
  }

  /**
   * Reserva números específicos para un usuario
   * @param reserveDto Datos de reserva
   * @param userId Usuario que reserva
   * @param expirationMinutes Minutos de expiración (por defecto 15)
   * @returns Números reservados exitosamente
   */
  async reserveNumbers(
    reserveDto: ReserveNumbersDto, 
    userId: string, 
    expirationMinutes: number = 15
  ): Promise<RaffleNumberDto[]> {
    const { raffle_id, numbers } = reserveDto;

    // Verificar que la rifa existe y está activa
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffle_id, deleted: false, enabled: true }
    });

    if (!raffle) {
      throw new NotFoundException(`Rifa con ID ${raffle_id} no encontrada o inactiva`);
    }

    // Verificar que todos los números solicitados están disponibles
    const requestedNumbers = await this.raffleNumberRepository
      .createQueryBuilder('rn')
      .where('rn.raffle_id = :raffle_id', { raffle_id })
      .andWhere('rn.number IN (:...numbers)', { numbers })
      .andWhere('rn.deleted = false')
      .getMany();

    // Filtrar por números específicos
    const availableNumbers = requestedNumbers.filter(rn => 
      numbers.includes(rn.number) && rn.status === RaffleNumberStatus.AVAILABLE
    );

    if (availableNumbers.length !== numbers.length) {
      const unavailableNumbers = numbers.filter(num => 
        !availableNumbers.some(an => an.number === num)
      );
      throw new BadRequestException(
        `Los siguientes números no están disponibles: ${unavailableNumbers.join(', ')}`
      );
    }

    // Reservar los números
    const reservedNumbers: RaffleNumber[] = [];
    for (const raffleNumber of availableNumbers) {
      raffleNumber.reserve(userId, expirationMinutes);
      reservedNumbers.push(raffleNumber);
    }

    // Guardar las reservas
    await this.raffleNumberRepository.save(reservedNumbers);

    return reservedNumbers.map(rn => rn.toDto());
  }

  /**
   * Libera números reservados que han expirado
   * @param raffleId ID de la rifa (opcional, si no se proporciona limpia todas las rifas)
   * @returns Cantidad de números liberados
   */
  async releaseExpiredReservations(raffleId?: string): Promise<number> {
    const query = this.raffleNumberRepository.createQueryBuilder('rn')
      .where('rn.status = :status', { status: RaffleNumberStatus.RESERVED })
      .andWhere('rn.reservation_expires IS NOT NULL')
      .andWhere('rn.reservation_expires < :now', { now: new Date() })
      .andWhere('rn.deleted = false');

    if (raffleId) {
      query.andWhere('rn.raffle_id = :raffleId', { raffleId });
    }

    const expiredNumbers = await query.getMany();

    // Liberar números expirados
    for (const raffleNumber of expiredNumbers) {
      raffleNumber.release('system'); // Usuario 'system' para liberación automática
    }

    if (expiredNumbers.length > 0) {
      await this.raffleNumberRepository.save(expiredNumbers);
    }

    return expiredNumbers.length;
  }

  /**
   * Marca números como vendidos y los asocia con un ticket
   * @param raffleId ID de la rifa
   * @param numbers Números a marcar como vendidos
   * @param ticketId ID del ticket generado
   * @param userId Usuario que realiza la venta
   * @returns Números marcados como vendidos
   */
  async markNumbersAsSold(
    raffleId: string, 
    numbers: number[], 
    ticketId: string, 
    userId: string
  ): Promise<RaffleNumberDto[]> {
    const raffleNumbers = await this.raffleNumberRepository
      .createQueryBuilder('rn')
      .where('rn.raffle_id = :raffleId', { raffleId })
      .andWhere('rn.number IN (:...numbers)', { numbers })
      .andWhere('rn.deleted = false')
      .getMany();

    // Filtrar por números específicos y verificar que están reservados por el usuario
    const userReservedNumbers = raffleNumbers.filter(rn => 
      numbers.includes(rn.number) && 
      rn.status === RaffleNumberStatus.RESERVED &&
      rn.reserved_by === userId
    );

    if (userReservedNumbers.length !== numbers.length) {
      throw new BadRequestException('No todos los números están reservados por este usuario');
    }

    // Marcar como vendidos
    for (const raffleNumber of userReservedNumbers) {
      raffleNumber.sell(ticketId, userId);
    }

    await this.raffleNumberRepository.save(userReservedNumbers);

    return userReservedNumbers.map(rn => rn.toDto());
  }

  /**
   * Obtiene los números reservados por un usuario específico
   * @param raffleId ID de la rifa
   * @param userId ID del usuario
   * @returns Números reservados por el usuario
   */
  async getUserReservedNumbers(raffleId: string, userId: string): Promise<RaffleNumberDto[]> {
    const reservedNumbers = await this.raffleNumberRepository.find({
      where: {
        raffle_id: raffleId,
        reserved_by: userId,
        status: RaffleNumberStatus.RESERVED,
        deleted: false
      },
      order: { number: 'ASC' }
    });

    return reservedNumbers.map(rn => rn.toDto());
  }
}