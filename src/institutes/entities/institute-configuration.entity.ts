import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Institution } from "./institute.entity";
import { InstituteConfigurationDto } from "../dto/institution-configuration.dto";

@Entity('institute_configurations')
@Index(['id', 'institute_id'])
export class InstituteConfiguration {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    code: string;

    @Column({ nullable: false })
    description: string;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false })
    value: string;

    @Column({ type: 'uuid', nullable: false })
    institute_id: string;

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

    @ManyToOne(() => Institution, (institute) => institute.configurations)
    institution: Institution;

    static fromDto(instituteConfigurationDto: InstituteConfigurationDto, userId: string) {
        const instituteConfiguration = new InstituteConfiguration();
        instituteConfiguration.code = instituteConfigurationDto.code;
        instituteConfiguration.description = instituteConfigurationDto.description;
        instituteConfiguration.type = instituteConfigurationDto.type;
        instituteConfiguration.value = instituteConfigurationDto.value;
        instituteConfiguration.createdBy = userId;
        instituteConfiguration.updatedBy = userId;
        return instituteConfiguration;
    }

    update(instituteConfiguration: InstituteConfigurationDto, userId: string) {
        Object.assign(this, instituteConfiguration);
        this.updatedBy = userId;
    }

    delete(userId: string) {
        this.enabled = false;
        this.deleted = true;
        this.updatedBy = userId;
    }

    toDto(): InstituteConfigurationDto {
        const dto = new InstituteConfigurationDto();
        dto.id = this.id;
        dto.code = this.code;
        dto.description = this.description;
        dto.type = this.type;
        dto.value = this.value;
        dto.enabled = this.enabled;
        return dto;
    }
}