import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { InstitutionDto } from './dto/institution.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { InstitutionsQueryDto } from './dto/institutions-query.dto';
import { InstitutionsListResponseDto, InstitutionResponseDto } from './dto/institution-response.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionAdminDto } from './dto/update-institution-admin.dto';
import { UpdateInstitutionStatusDto, InstitutionStatusResponseDto } from './dto/update-institution-status.dto';

@Controller('institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthService, RolesGuard)
export class InstitutesController {
  constructor(private readonly institutesService: InstitutesService) { }

  @Get()
  @Roles('ADMINSUPREMO')
  @ApiOkResponse({
    description: 'Lista paginada de instituciones con filtros (Solo ADMINSUPREMO)',
    type: InstitutionsListResponseDto,
  })
  async getInstitutions(@Query() query: InstitutionsQueryDto) {
    try {
      const result = await this.institutesService.getInstitutionsList(query);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, 500);
    }
  }

  @Post()
  @Roles('ADMINSUPREMO')
  @ApiOperation({ 
    summary: 'Crear nueva institución',
    description: 'Endpoint exclusivo para ADMINSUPREMO. Crea una nueva institución en el sistema' 
  })
  async createInstitution(@Body() createInstitutionDto: CreateInstitutionDto) {
    try {
      const institution = await this.institutesService.createInstitutionForAdmin(createInstitutionDto);
      return ApiResponse.success(institution);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  @Put(':id')
  @Roles('ADMINSUPREMO')
  @ApiOperation({ 
    summary: 'Actualizar institución existente',
    description: 'Endpoint exclusivo para ADMINSUPREMO. Actualiza los datos de una institución' 
  })
  async updateInstitution(
    @Param('id') id: string,
    @Body() updateInstitutionDto: UpdateInstitutionAdminDto
  ) {
    try {
      const institution = await this.institutesService.updateInstitutionForAdmin(id, updateInstitutionDto);
      return ApiResponse.success(institution);
    } catch (error) {
      return ApiResponse.error(error.message, error.status || 400);
    }
  }

  @Patch(':id/status')
  @Roles('ADMINSUPREMO')
  @ApiOperation({ 
    summary: 'Cambiar estado de institución (activo/inactivo)',
    description: 'Endpoint exclusivo para ADMINSUPREMO. Activa o desactiva una institución' 
  })
  async updateInstitutionStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInstitutionStatusDto
  ) {
    try {
      const result = await this.institutesService.updateInstitutionStatus(id, updateStatusDto.isActive);
      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message, error.status || 400);
    }
  }

  @Get('/search')
  @ApiQuery({ name: 'page', required: false, type: Number, default: PageReference.PAGE })
  @ApiQuery({ name: 'size', required: false, type: Number, default: PageReference.SIZE })
  @ApiOkResponse({
    description: 'Lista paginada de instituciones',
    type: ApiResponse<PagedResponse<InstitutionDto>>,
  })
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
    @Query('enabled') enabled?: boolean,
  ) {
    const institutes = await this.institutesService.search(page, size, enabled);

    return ApiResponse.success(institutes);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const institute = await this.institutesService.findOne(id);
    if (!institute) return ApiResponse.notFound('Institución no encontrada');
    return ApiResponse.success(institute);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createInstitute(@UploadedFile() file: Express.Multer.File, @Body() createInstituteDto: InstitutionDto) {
    const institute = await this.institutesService.createInstitute(file, createInstituteDto);
    return ApiResponse.success(institute);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateInstitute(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateInstituteDto: UpdateInstituteDto,
  ) {
    const institute = await this.institutesService.updateInstitute(id, file, updateInstituteDto);

    if (!institute) return ApiResponse.notFound('Institución no encontrada');

    return ApiResponse.success(institute);
  }
}
