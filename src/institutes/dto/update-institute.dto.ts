import { PartialType } from '@nestjs/mapped-types';
import { InstitutionDto } from './institution.dto';

export class UpdateInstituteDto extends PartialType(InstitutionDto) {}
