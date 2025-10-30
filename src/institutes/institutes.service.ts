import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institute.entity';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { InstitutionDto } from './dto/institution.dto';
import { UploadFileService } from 'src/upload-file/upload-file.service';
import { UpdateInstituteDto } from './dto/update-institute.dto';

@Injectable()
export class InstitutesService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutesRepository: Repository<Institution>,
    private readonly uploadFileService: UploadFileService,
  ) { }

  async search(page: number, size: number, enabled?: boolean): Promise<PagedResponse<InstitutionDto>> {
    const skip = (page - 1) * size;

    const [institutes, totalElements] = await this.institutesRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: skip,
      take: size,
      where: [enabled !== undefined ? { enabled: enabled } : {}],
    });

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<InstitutionDto>(institutes.map(i => i.toDto()), page, size, totalPage, totalElements, last);
  }

  async findOne(id: string): Promise<InstitutionDto | undefined> {
    const institute = await this.institutesRepository.createQueryBuilder('institute')
      .leftJoinAndSelect('institute.departments', 'department', 'department.deleted = false')
      .where('institute.id = :id', { id })
      .andWhere('institute.deleted = false')
      .getOne();
    return institute?.toDto();
  }

  async createInstitute(file: Express.Multer.File, createInstituteDto: InstitutionDto) {

    //save here image from external storage and return url
    const urlFile = await this.uploadFileService.uploadFile(file);

    let institute = this.institutesRepository.create(createInstituteDto);
    institute.createdBy = ''
    institute.updatedBy = ''

    if (urlFile) institute.picture = urlFile;

    institute = await this.institutesRepository.save(institute);

    const instituteI = await this.institutesRepository.findOne({ where: { id: institute.id }, relations: ['departments'] });

    return instituteI?.toDto();
  }

  async updateInstitute(
    id: string,
    file: Express.Multer.File,
    updateInstituteDto: UpdateInstituteDto,
  ) {
    let institute = await this.institutesRepository.findOne({ where: { id, deleted: false }, relations: ['departments'] });

    if (!institute) return undefined;

    if (file) {
      const urlFile = await this.uploadFileService.uploadFile(file);
      if (urlFile) institute.picture = urlFile;
    }

    institute.update(updateInstituteDto, id);

    institute = await this.institutesRepository.save(institute);

    institute = await this.institutesRepository.findOne({ where: { id: institute.id, deleted: false, departments: { deleted: false } }, relations: ['departments'] });

    return institute?.toDto();
  }
}
