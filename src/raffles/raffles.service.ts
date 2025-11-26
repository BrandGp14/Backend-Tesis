import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raffle } from './entities/raffle.entity';
import { RaffleDto } from './dto/raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { UploadFileService } from 'src/upload-file/upload-file.service';
import { Institution } from 'src/institutes/entities/institute.entity';
import { InstitutionDepartment } from 'src/institutes/entities/institution-department.entity';
import { User } from 'src/users/entities/user.entity';
import { RaffleNumber } from './entities/raffle-number.entity';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    @InjectRepository(RaffleNumber)
    private readonly raffleNumberRepository: Repository<RaffleNumber>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
    @InjectRepository(InstitutionDepartment)
    private readonly departmentRepository: Repository<InstitutionDepartment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uploadFileService: UploadFileService,
  ) { }

  async search(page: number, size: number, enabled?: boolean, institution?: string, organizer?: string, department?: string, endDate?: Date,
    popularity?: boolean, title?: string) {
    const skip = (page - 1) * size;

    const query = this.raffleRepository.createQueryBuilder('raffle')
      .leftJoinAndSelect('raffle.raffleImages', 'raffleImages', 'raffleImages.deleted = false')
      .leftJoinAndSelect('raffle.user', 'user')
      .leftJoinAndSelect('raffle.institution', 'institution')
      .leftJoinAndSelect('raffle.department', 'department')
      .leftJoinAndSelect('raffle.raffleGiftImages', 'raffleGiftImages', 'raffleGiftImages.deleted = false')
      .where('raffle.deleted = false');

    if (enabled !== undefined) query.andWhere('raffle.enabled = :enabled', { enabled });
    if (institution !== undefined) query.andWhere('institution.id = :institution', { institution });
    if (organizer !== undefined) query.andWhere('user.id = :organizer', { organizer });
    if (department !== undefined) query.andWhere('department.id = :department', { department });
    if (endDate !== undefined) query.andWhere('raffle.endDate <= :endDate', { endDate });
    if (title !== undefined) query.andWhere('LOWER(raffle.title) LIKE :title', { title: `%${title.toLowerCase()}%` });

    if (popularity !== undefined && popularity) query.orderBy('raffle.sold', 'DESC').addOrderBy('raffle.createdAt', 'DESC');
    else query.orderBy('raffle.createdAt', 'DESC').addOrderBy('raffle.sold', 'DESC');

    const [raffles, totalElements] = await query
      .skip(skip)
      .take(size)
      .getManyAndCount();

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<RaffleDto>(raffles.map(r => r.toDto()), page, size, totalPage, totalElements, last);
  }

  async findOne(id: string) {
    const raffle = await this.raffleRepository.findOne(
      {
        where: { id, deleted: false, raffleImages: { deleted: false } },
        relations: ['raffleImages', 'user', 'institution', 'department'],
      });
    return raffle?.toDto();
  }

  async create(files: Express.Multer.File[], dto: RaffleDto, jwtDto: JwtDto) {
    // Validar que las foreign keys existan antes de crear la rifa
    const institution = await this.institutionRepository.findOne({
      where: { id: dto.institution_id }
    });
    if (!institution) {
      throw new BadRequestException(`Institución con ID ${dto.institution_id} no existe`);
    }

    const department = await this.departmentRepository.findOne({
      where: { id: dto.institution_department_id, institution: { id: dto.institution_id } }
    });
    if (!department) {
      throw new BadRequestException(`Departamento con ID ${dto.institution_department_id} no existe en la institución`);
    }

    const organizer = await this.userRepository.findOne({
      where: { id: dto.organizer_id, deleted: false }
    });
    if (!organizer) {
      throw new BadRequestException(`Usuario organizador con ID ${dto.organizer_id} no existe`);
    }

    const uploadFiles = files && files.length > 0 ? await Promise.all(
      files.map(async (f) => {
        const existInRaffleImages = dto.raffleImages?.find(ri => ri.imageUrl === f.originalname) || dto.raffleGiftImages?.find(ri => ri.imageUrl === f.originalname);
        if (!existInRaffleImages) return undefined;
        const url = await this.uploadFileService.uploadFile(f);
        return { fileName: f.originalname, fileUrl: url };
      })
    ) : [];

    if (dto.raffleImages && Array.isArray(dto.raffleImages)) {
      dto.raffleImages.forEach((raffleImages) => {
        const f = uploadFiles.find(f => f?.fileName === raffleImages.imageUrl);
        if (f && f.fileUrl) raffleImages.imageUrl = f.fileUrl;
      });
    }

    if (dto.raffleGiftImages && Array.isArray(dto.raffleGiftImages)) {
      dto.raffleGiftImages.forEach((raffleGiftImages) => {
        const f = uploadFiles.find(f => f?.fileName === raffleGiftImages.imageUrl);
        if (f && f.fileUrl) raffleGiftImages.imageUrl = f.fileUrl;
      });
    }

    let raffle = Raffle.fromDto(dto, jwtDto.sub);
    raffle = await this.raffleRepository.save(raffle);

    // Generar números individuales para la rifa
    await this.generateRaffleNumbers(raffle.id, dto.available, jwtDto.sub);

    const raffleI = await this.raffleRepository.findOne({ 
      where: { id: raffle.id }, 
      relations: ['raffleImages', 'user', 'institution', 'department', 'raffleGiftImages', 'raffleNumbers'] 
    });

    return raffleI?.toDto();
  }

  async update(id: string, files: Express.Multer.File[], dto: RaffleDto, jwtDto: JwtDto) {
    let raffle = await this.raffleRepository.findOne(
      {
        where: { id, deleted: false, raffleImages: { deleted: false } },
        relations: ['raffleImages', 'user', 'institution', 'department', 'raffleGiftImages'],
      }
    );
    if (!raffle) return undefined;

    const uploadFiles = await Promise.all(
      files.map(async (f) => {
        const existInRaffleImages = dto.raffleImages.find(ri => ri.imageUrl === f.originalname) || dto.raffleGiftImages.find(ri => ri.imageUrl === f.originalname);
        if (!existInRaffleImages) return undefined;
        const url = await this.uploadFileService.uploadFile(f);
        return { fileName: f.filename, fileUrl: url };
      })
    );

    dto.raffleImages.forEach((raffleImages) => {
      const f = uploadFiles.find(f => f?.fileName === raffleImages.imageUrl);
      if (f && f.fileUrl) raffleImages.imageUrl = f.fileUrl;
    })

    dto.raffleGiftImages.forEach((raffleGiftImages) => {
      const f = uploadFiles.find(f => f?.fileName === raffleGiftImages.imageUrl);
      if (f && f.fileUrl) raffleGiftImages.imageUrl = f.fileUrl;
    })

    raffle.update(dto, jwtDto.sub);
    await this.raffleRepository.save(raffle);

    raffle = await this.raffleRepository.findOne(
      {
        where: { id: raffle.id, deleted: false, raffleImages: { deleted: false } },
        relations: ['raffleImages', 'user', 'institution', 'department'],
      });
    return raffle?.toDto();
  }

  async remove(id: string, jwtDto: JwtDto) {
    let raffle = await this.raffleRepository.findOne(
      {
        where: { id, deleted: false, raffleImages: { deleted: false } },
        relations: ['raffleImages', 'user', 'institution', 'department'],
      });
    if (!raffle) return undefined;

    raffle.delete(jwtDto.sub);
    raffle = await this.raffleRepository.save(raffle);
    return raffle?.id
  }

  async searchMe(jwtDto: JwtDto) {
    const raffles = await this.raffleRepository.createQueryBuilder('raffle')
      .leftJoin('raffle.raffleImages', 'raffleImages', 'raffleImages.deleted = false')
      .leftJoin('raffle.institution', 'institution')
      .leftJoin('raffle.department', 'department')
      .leftJoin('raffle.tickets', 'tickets', 'tickets.deleted = false AND tickets.email = :email', { email: jwtDto.email })
      .where('raffle.deleted = false')
      .getMany();

    return raffles?.map(r => r.toDto());
  }

  /**
   * Genera números individuales para una rifa recién creada
   * @param raffleId ID de la rifa
   * @param totalNumbers Cantidad total de números a generar (campo available)
   * @param userId Usuario que crea los números
   */
  private async generateRaffleNumbers(raffleId: string, totalNumbers: number, userId: string): Promise<void> {
    const raffleNumbers: RaffleNumber[] = [];

    // Generar números del 1 hasta totalNumbers
    for (let i = 1; i <= totalNumbers; i++) {
      const raffleNumber = RaffleNumber.create(raffleId, i, userId);
      raffleNumbers.push(raffleNumber);
    }

    // Guardar todos los números en lotes para mejor performance
    const batchSize = 1000;
    for (let i = 0; i < raffleNumbers.length; i += batchSize) {
      const batch = raffleNumbers.slice(i, i + batchSize);
      await this.raffleNumberRepository.save(batch);
    }
  }

  /**
   * Obtiene estadísticas de disponibilidad de números para una rifa
   * @param raffleId ID de la rifa
   * @returns Estadísticas de números disponibles, reservados y vendidos
   */
  async getRaffleNumbersStats(raffleId: string) {
    const stats = await this.raffleNumberRepository
      .createQueryBuilder('rn')
      .select('rn.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('rn.raffle_id = :raffleId AND rn.deleted = false', { raffleId })
      .groupBy('rn.status')
      .getRawMany();

    const result = {
      available: 0,
      reserved: 0,
      sold: 0
    };

    stats.forEach(stat => {
      result[stat.status.toLowerCase()] = parseInt(stat.count);
    });

    return result;
  }

  /**
   * Obtiene los números vendidos de una rifa
   * @param raffleId ID de la rifa
   * @returns Array de números vendidos
   */
  async getSoldNumbers(raffleId: string): Promise<number[]> {
    const soldNumbers = await this.raffleNumberRepository.find({
      where: { 
        raffle_id: raffleId, 
        status: 'SOLD' as any,
        deleted: false 
      },
      select: ['number'],
      order: { number: 'ASC' }
    });

    return soldNumbers.map(rn => rn.number);
  }

  /**
   * Reserva números para un usuario
   * @param raffleId ID de la rifa
   * @param selectedNumbers Array de números a reservar
   * @param userId ID del usuario
   * @returns Información de la reserva
   */
  async reserveNumbers(raffleId: string, selectedNumbers: number[], userId: string) {
    // Verificar que la rifa existe
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId, deleted: false }
    });

    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }

    // Verificar que los números existen y están disponibles
    const raffleNumbers = await this.raffleNumberRepository.find({
      where: { 
        raffle_id: raffleId, 
        number: selectedNumbers as any,
        deleted: false 
      }
    });

    if (raffleNumbers.length !== selectedNumbers.length) {
      throw new BadRequestException('Some numbers are not valid for this raffle');
    }

    const unavailableNumbers = raffleNumbers.filter(rn => rn.status !== 'AVAILABLE');
    if (unavailableNumbers.length > 0) {
      throw new BadRequestException(`Numbers ${unavailableNumbers.map(rn => rn.number).join(', ')} are not available`);
    }

    // Reservar los números
    const reservationId = `res_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    for (const raffleNumber of raffleNumbers) {
      raffleNumber.reserve(userId, 15);
    }

    await this.raffleNumberRepository.save(raffleNumbers);

    return {
      reservationId,
      expiresAt: expiresAt.toISOString(),
      reservedNumbers: selectedNumbers,
      timeRemaining: 900 // 15 minutos en segundos
    };
  }
}
