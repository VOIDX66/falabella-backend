import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity
} from "typeorm";

@Entity()
export class Section extends BaseEntity {
    @PrimaryGeneratedColumn()
    id_section: number;

    @Column({ unique : true })
    name_section: string;
}
