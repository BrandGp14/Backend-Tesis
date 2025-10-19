import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { InstitutionDto } from './dto/institution.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateInstituteDto } from './dto/update-institute.dto';

@Controller('institutes')
export class InstitutesController {
  constructor(private readonly institutesService: InstitutesService) { }

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
  async getInstitute(@Param('id') id: string) {
    const institute = await this.institutesService.getInstitute(id);
    if (!institute) return ApiResponse.notFound('Institución no encontrada');
    return ApiResponse.success(institute);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createInstitute(
    @UploadedFile() file: Express.Multer.File,
    @Body() createInstituteDto: InstitutionDto,
  ) {
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
