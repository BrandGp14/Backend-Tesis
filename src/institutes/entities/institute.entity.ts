import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UpdateInstituteDto } from '../dto/update-institute.dto';
import { InstitutionDto } from '../dto/institution.dto';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { InstitutionDepartment } from './institution-department.entity';
import { InstituteConfiguration } from './institute-configuration.entity';

@Entity('institutions')
@Index('UQ_INSTITUTION_DOMAIN_UNIQUE_ON_DELETED_FALSE', ['domain'], { unique: true, where: '"deleted" = false' })
@Index('UQ_INSTITUTION_DOCUMENT_NUMBER_UNIQUE_ON_DELETED_FALSE', ['document_number'], { unique: true, where: '"deleted" = false' })
@Index(['id', 'document_number'])
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  document_number: string;

  @Column()
  document_type: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  website: string;

  @Column()
  domain: string;

  @Column({ nullable: true })
  picture?: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Raffle, (raffle) => raffle.institution)
  raffles: Raffle[];

  @OneToMany(() => InstitutionDepartment, (institutionDepartment) => institutionDepartment.institution, { cascade: true })
  departments: InstitutionDepartment[];

  @OneToMany(() => InstituteConfiguration, (institutionConfiguration) => institutionConfiguration.institution, { cascade: true })
  configurations: InstituteConfiguration[];

  static fromDto(instituteDto: InstitutionDto, userId: string) {
    const institute = new Institution();
    institute.description = instituteDto.description;
    institute.document_number = instituteDto.document_number;
    institute.document_type = instituteDto.document_type;
    institute.address = instituteDto.address;
    institute.phone = instituteDto.phone;
    institute.email = instituteDto.email;
    institute.website = instituteDto.website;
    institute.domain = instituteDto.domain;
    institute.createdBy = userId;
    institute.updatedBy = userId;

    if (instituteDto.departments.length > 0) {
      institute.departments = [
        ...instituteDto.departments.map((institutionDepartmentDto) => InstitutionDepartment.fromDto(institutionDepartmentDto, userId))
      ]
    }

    if (instituteDto.configurations.length > 0) {
      institute.configurations = [
        ...instituteDto.configurations.map((institutionConfigurationDto) => InstituteConfiguration.fromDto(institutionConfigurationDto, userId))
      ]
    }

    return institute;
  }

  update(institute: UpdateInstituteDto, userId: string) {
    Object.assign(this, institute);
    this.updatedBy = userId;

    this.departments = this.departments.filter(d => d.id);
    this.configurations = this.configurations.filter(d => d.id);

    this.departments.forEach((department) => {
      const departmentOp = institute.departments?.find((departmentOp) => departmentOp.id === department.id);
      if (departmentOp) department.update(departmentOp, userId);
      else department.delete(userId);
    })

    this.departments = [
      ...this.departments.filter(d => !d.deleted),
      ...institute.departments!.filter((department) => !department.id).map((department) => InstitutionDepartment.fromDto(department, userId))
    ]

    this.configurations.forEach((configuration) => {
      const configurationOp = institute.configurations?.find((configurationOp) => configurationOp.id === configuration.id);
      if (configurationOp) configuration.update(configurationOp, userId);
      else configuration.delete(userId);
    })

    this.configurations = [
      ...this.configurations.filter(d => !d.deleted),
      ...institute.configurations!.filter((configuration) => !configuration.id).map((configuration) => InstituteConfiguration.fromDto(configuration, userId))
    ]
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;

    this.departments.forEach((department) => { department.delete(userId); })
    this.configurations.forEach((configuration) => { configuration.delete(userId); })
  }

  toDto(): InstitutionDto {
    const dto = new InstitutionDto();
    dto.id = this.id;
    dto.description = this.description;
    dto.document_number = this.document_number;
    dto.document_type = this.document_type;
    dto.address = this.address;
    dto.phone = this.phone;
    dto.email = this.email;
    dto.website = this.website;
    dto.domain = this.domain;
    dto.enabled = this.enabled;

    if (this.departments) dto.departments = this.departments.map(d => d.toDto());
    if (this.configurations) dto.configurations = this.configurations.map(d => d.toDto());

    return dto;
  }
}
