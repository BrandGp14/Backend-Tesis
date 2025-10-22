import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raffle } from './entities/raffle.entity';
import { RaffleDto } from './dto/raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { JwtDto } from 'src/jwt-auth/dto/jwt.dto';
import { UploadFileService } from 'src/upload-file/upload-file.service';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private readonly raffleRepository: Repository<Raffle>,
    private readonly uploadFileService: UploadFileService,
  ) { }

  async search(page: number, size: number, enabled?: boolean, institution?: string, organizer?: string) {
    const skip = (page - 1) * size;

    const query = this.raffleRepository.createQueryBuilder('raffle')
      .leftJoinAndSelect('raffle.raffleImages', 'raffleImages', 'raffleImages.deleted = false')
      .leftJoinAndSelect('raffle.user', 'user')
      .leftJoinAndSelect('raffle.institution', 'institution')
      .leftJoinAndSelect('raffle.department', 'department')
      .where('raffle.deleted = false');

    if (enabled !== undefined) query.andWhere('raffle.enabled = :enabled', { enabled });
    if (institution !== undefined) query.andWhere('institution.id = :institution', { institution });
    if (organizer !== undefined) query.andWhere('user.id = :organizer', { organizer });

    const [raffles, totalElements] = await query
      .orderBy('raffle.createdAt', 'DESC')
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

    const uploadFiles = await Promise.all(
      files.map(async (f) => {
        const existInRaffleImages = dto.raffleImages.find(ri => ri.imageUrl === f.originalname);
        if (!existInRaffleImages) return undefined;
        const url = await this.uploadFileService.uploadFile(f);
        return { fileName: f.originalname, fileUrl: url };
      })
    );

    dto.raffleImages.forEach((raffleImages) => {
      const f = uploadFiles.find(f => f?.fileName === raffleImages.imageUrl);
      if (f && f.fileUrl) raffleImages.imageUrl = f.fileUrl;
    })

    let raffle = Raffle.fromDto(dto, jwtDto.sub);
    raffle = await this.raffleRepository.save(raffle);

    const raffleI = await this.raffleRepository.findOne({ where: { id: raffle.id }, relations: ['raffleImages', 'user', 'institution', 'department'] });

    return raffleI?.toDto();
  }

  async update(id: string, files: Express.Multer.File[], dto: RaffleDto, jwtDto: JwtDto) {
    let raffle = await this.raffleRepository.findOne(
      {
        where: { id, deleted: false, raffleImages: { deleted: false } },
        relations: ['raffleImages', 'user', 'institution', 'department'],
      }
    );
    if (!raffle) return undefined;

    const uploadFiles = await Promise.all(
      files.map(async (f) => {
        const existInRaffleImages = dto.raffleImages.find(ri => ri.imageUrl === f.originalname);
        if (!existInRaffleImages) return undefined;
        const url = await this.uploadFileService.uploadFile(f);
        return { fileName: f.filename, fileUrl: url };
      })
    );

    dto.raffleImages.forEach((raffleImages) => {
      const f = uploadFiles.find(f => f?.fileName === raffleImages.imageUrl);
      if (f && f.fileUrl) raffleImages.imageUrl = f.fileUrl;
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
}
