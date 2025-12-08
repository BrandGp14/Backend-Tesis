import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Institution } from "./institute.entity";
import { InstitutionDepartmentDto } from "../dto/institution-department.dto";
import { Raffle } from "src/raffles/entities/raffle.entity";
import { Professor } from "../../professors/entities/professor.entity";

@Entity('departments')
@Index(['id', 'code'])
export class InstitutionDepartment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    code: string;

    @Column()
    description: string;

    @Column({ type: 'uuid', nullable: true })
    institution_id: string;

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

    @ManyToOne(() => Institution, (institution) => institution.departments)
    @JoinColumn({ name: 'institution_id' })
    institution: Institution;

    @OneToMany(() => Raffle, (raffle) => raffle.department)
    raffles: Raffle[];

    @OneToMany(() => Professor, (professor) => professor.department)
    professors: Professor[];

    static fromDto(institutionDepartmentDto: InstitutionDepartmentDto, userId: string) {
        const institutionDepartment = new InstitutionDepartment();
        institutionDepartment.code = institutionDepartmentDto.departmentCode;
        institutionDepartment.description = institutionDepartmentDto.departmentDescription;
        institutionDepartment.createdBy = userId;
        institutionDepartment.updatedBy = userId;
        return institutionDepartment;
    }

    update(dto: InstitutionDepartmentDto, userId: string) {
        this.code = dto.departmentCode;
        this.description = dto.departmentDescription;
        this.updatedBy = userId;
    }

    delete(userId: string) {
        this.enabled = false;
        this.deleted = true;
        this.updatedBy = userId;
    }

    toDto(): InstitutionDepartmentDto {
        const dto = new InstitutionDepartmentDto();
        dto.id = this.id;
        dto.departmentCode = this.code;
        dto.departmentDescription = this.description;
        dto.enabled = this.enabled;
        return dto;
    }
}