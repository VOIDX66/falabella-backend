import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
} from "typeorm";

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id_category: number;

    @Column({ unique: true })
    name_category: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: "text", nullable: true })
    banner_image: string | null;
}
