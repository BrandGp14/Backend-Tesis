import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UpdateInstituteDto } from '../dto/update-institute.dto';
import { InstitutionDto } from '../dto/institution.dto';

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

  update(institute: UpdateInstituteDto, userId: string) {
    Object.assign(this, institute);
    this.updatedBy = userId;
  }

  delete(userId: string) {
    this.enabled = false;
    this.deleted = true;
    this.updatedBy = userId;
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
    return dto;
  }
}
