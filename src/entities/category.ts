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

    @Column({ unique : true })
    name_category: string;
}
