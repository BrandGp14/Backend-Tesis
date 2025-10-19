import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UpdateInstituteDto } from '../dto/update-institute.dto';
import { InstitutionDto } from '../dto/institution.dto';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ unique: true })
  ruc: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  website: string;

  @Column({ unique: true })
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
    dto.ruc = this.ruc;
    dto.address = this.address;
    dto.phone = this.phone;
    dto.email = this.email;
    dto.website = this.website;
    dto.domain = this.domain;
    dto.enabled = this.enabled;
    return dto;
  }
}
