import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity
} from "typeorm";

@Entity()
export class Subcategory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id_subcategory: number;

    @Column({ unique : true })
    name_subcategory: string;

    @Column({ unique : true })
    slug : string;
}