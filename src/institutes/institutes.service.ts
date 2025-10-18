import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institute.entity';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UploadFileService } from 'src/upload-file/upload-file.service';

@Injectable()
export class InstitutesService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutesRepository: Repository<Institution>,
    private readonly uploadFileService: UploadFileService,
  ) {}

  async search(page: number, size: number): Promise<PagedResponse<Institution>> {
    const skip = (page - 1) * size;
    const [institutes, totalElements] = await this.institutesRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: skip,
      take: size,
    });

    const totalPage = Math.ceil(totalElements / size);
    const last = page >= totalPage;

    return new PagedResponse<Institution>(institutes, page, size, totalPage, totalElements, last);
  }

  async getInstitute(id: string): Promise<Institution | null> {
    const institute = await this.institutesRepository.findOne({ where: { id } });
    return institute;
  }

  async createInstitute(
    file: Express.Multer.File,
    createInstituteDto: CreateInstituteDto,
  ): Promise<Institution> {
    //save here image from external storage and return url

    const urlFile = await this.uploadFileService.uploadFile(file);

    const institute = this.institutesRepository.create(createInstituteDto);
    institute.picture = urlFile;
    return await this.institutesRepository.save(institute);
  }
}
