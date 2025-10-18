import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { ApiResponse } from 'src/common/dto/api.response.dto';
import { PageReference } from 'src/common/enum/page.reference';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { PagedResponse } from 'src/common/dto/paged.response.dto';
import { Institution } from './entities/institute.entity';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('institutes')
export class InstitutesController {
  constructor(private readonly institutesService: InstitutesService) {}

  @Get('/search')
  @ApiQuery({ name: 'page', required: false, type: Number, default: PageReference.PAGE })
  @ApiQuery({ name: 'size', required: false, type: Number, default: PageReference.SIZE })
  @ApiOkResponse({
    description: 'Lista pagina de instituciones',
    type: ApiResponse<PagedResponse<Institution>>,
  })
  async search(
    @Query('page', new DefaultValuePipe(PageReference.PAGE), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(PageReference.SIZE), ParseIntPipe) size: number,
  ) {
    const institutes = await this.institutesService.search(page, size);

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
    @Body() createInstituteDto: CreateInstituteDto,
  ) {
    const institute = await this.institutesService.createInstitute(file, createInstituteDto);
    return ApiResponse.success(institute);
  }
}
