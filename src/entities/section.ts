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

    @Column({ unique: true })
    name_section: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: "text", nullable: true })
    banner_image: string | null;
}