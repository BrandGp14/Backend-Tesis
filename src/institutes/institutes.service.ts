import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institute.entity';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { InstitutionDto } from './dto/institution.dto';
import { UploadFileService } from 'src/upload-file/upload-file.service';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InstitutionsQueryDto } from './dto/institutions-query.dto';
import { InstitutionResponseDto, InstitutionsListResponseDto, PaginationDto } from './dto/institution-response.dto';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionAdminDto } from './dto/update-institution-admin.dto';
import { InstitutionStatusResponseDto } from './dto/update-institution-status.dto';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

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

  async getInstitutionsList(query: InstitutionsQueryDto): Promise<InstitutionsListResponseDto> {
    const { page = 1, limit = 10, status = 'all', search } = query;
    const skip = (page - 1) * limit;

    // Usar QueryBuilder para construir la consulta con búsqueda
    let queryBuilder = this.institutesRepository.createQueryBuilder('institution')
      .where('institution.deleted = false');

    // Aplicar filtro de status
    if (status === 'active') {
      queryBuilder.andWhere('institution.enabled = true');
    } else if (status === 'inactive') {
      queryBuilder.andWhere('institution.enabled = false');
    }

    // Aplicar búsqueda por nombre o dominio
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(institution.description) LIKE LOWER(:search) OR LOWER(institution.domain) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Aplicar ordenamiento y paginación
    queryBuilder
      .orderBy('institution.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Ejecutar query con paginación
    const [institutions, total] = await queryBuilder.getManyAndCount();

    // Mapear entidades a DTOs de respuesta
    const data: InstitutionResponseDto[] = institutions.map(institution => ({
      id: institution.id,
      name: institution.description,
      domain: institution.domain,
      logoUrl: institution.picture || null,
      contactEmail: institution.email || '',
      contactPhone: institution.phone || '',
      address: institution.address || '',
      isActive: institution.enabled,
      createdAt: institution.createdAt.toISOString(),
    }));

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationDto = {
      total,
      page,
      limit,
      totalPages,
    };

    return {
      data,
      pagination,
    };
  }

  async createInstitutionForAdmin(createDto: CreateInstitutionDto): Promise<InstitutionResponseDto> {
    // Validar que el dominio no exista
    const existingByDomain = await this.institutesRepository.findOne({
      where: { domain: createDto.domain, deleted: false }
    });

    if (existingByDomain) {
      throw new ConflictException(`Ya existe una institución con el dominio: ${createDto.domain}`);
    }

    // Validar que el nombre no exista
    const existingByName = await this.institutesRepository.findOne({
      where: { description: createDto.name, deleted: false }
    });

    if (existingByName) {
      throw new ConflictException(`Ya existe una institución con el nombre: ${createDto.name}`);
    }

    // Validar formato del dominio (no debe contener @)
    if (createDto.domain.includes('@')) {
      throw new BadRequestException('El dominio no debe contener el símbolo @');
    }

    // Crear nueva institución
    const newInstitution = this.institutesRepository.create({
      description: createDto.name,
      domain: createDto.domain,
      email: createDto.contactEmail,
      phone: createDto.contactPhone,
      address: createDto.address,
      picture: createDto.logoUrl || undefined,
      document_number: 'TEMP-' + Date.now(), // Temporal hasta que se proporcione
      document_type: 'RUC', // Por defecto
      website: '', // Opcional
      enabled: true,
      deleted: false,
      createdBy: 'SUPER_ADMIN',
      updatedBy: 'SUPER_ADMIN'
    });

    // Guardar en base de datos
    const savedInstitution = await this.institutesRepository.save(newInstitution);

    // Retornar como DTO de respuesta
    return {
      id: savedInstitution.id,
      name: savedInstitution.description,
      domain: savedInstitution.domain,
      logoUrl: savedInstitution.picture || null,
      contactEmail: savedInstitution.email || '',
      contactPhone: savedInstitution.phone || '',
      address: savedInstitution.address || '',
      isActive: savedInstitution.enabled,
      createdAt: savedInstitution.createdAt.toISOString(),
    };
  }

  async updateInstitutionForAdmin(id: string, updateDto: UpdateInstitutionAdminDto): Promise<InstitutionResponseDto> {
    // Buscar la institución por ID
    const existingInstitution = await this.institutesRepository.findOne({
      where: { id, deleted: false }
    });

    if (!existingInstitution) {
      throw new NotFoundException(`Institución con ID ${id} no encontrada`);
    }

    // Validar que el dominio no esté en uso por otra institución
    if (updateDto.domain !== existingInstitution.domain) {
      const existingByDomain = await this.institutesRepository.findOne({
        where: { domain: updateDto.domain, deleted: false }
      });

      if (existingByDomain && existingByDomain.id !== id) {
        throw new ConflictException(`Ya existe una institución con el dominio: ${updateDto.domain}`);
      }
    }

    // Validar que el nombre no esté en uso por otra institución
    if (updateDto.name !== existingInstitution.description) {
      const existingByName = await this.institutesRepository.findOne({
        where: { description: updateDto.name, deleted: false }
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(`Ya existe una institución con el nombre: ${updateDto.name}`);
      }
    }

    // Validar formato del dominio (no debe contener @)
    if (updateDto.domain.includes('@')) {
      throw new BadRequestException('El dominio no debe contener el símbolo @');
    }

    // Actualizar los campos
    existingInstitution.description = updateDto.name;
    existingInstitution.domain = updateDto.domain;
    existingInstitution.email = updateDto.contactEmail;
    existingInstitution.phone = updateDto.contactPhone;
    existingInstitution.address = updateDto.address;
    existingInstitution.picture = updateDto.logoUrl || undefined;
    existingInstitution.updatedBy = 'SUPER_ADMIN';

    // Guardar cambios
    const updatedInstitution = await this.institutesRepository.save(existingInstitution);

    // Retornar como DTO de respuesta
    return {
      id: updatedInstitution.id,
      name: updatedInstitution.description,
      domain: updatedInstitution.domain,
      logoUrl: updatedInstitution.picture || null,
      contactEmail: updatedInstitution.email || '',
      contactPhone: updatedInstitution.phone || '',
      address: updatedInstitution.address || '',
      isActive: updatedInstitution.enabled,
      createdAt: updatedInstitution.createdAt.toISOString(),
    };
  }

  async updateInstitutionStatus(id: string, isActive: boolean): Promise<InstitutionStatusResponseDto> {
    // Buscar la institución por ID
    const existingInstitution = await this.institutesRepository.findOne({
      where: { id, deleted: false }
    });

    if (!existingInstitution) {
      throw new NotFoundException(`Institución con ID ${id} no encontrada`);
    }

    // Actualizar solo el estado
    existingInstitution.enabled = isActive;
    existingInstitution.updatedBy = 'SUPER_ADMIN';

    // Guardar cambios
    await this.institutesRepository.save(existingInstitution);

    // Retornar respuesta simple
    return {
      id: existingInstitution.id,
      isActive: existingInstitution.enabled,
    };
  }
}
