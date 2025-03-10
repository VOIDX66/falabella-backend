import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from "typeorm";
import { Section } from "./section";
import { Category } from "./category";

@Entity()
export class SectionCategory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Section, { onDelete: "CASCADE" })
    section: Section;

    @ManyToOne(() => Category, { onDelete: "CASCADE" })
    category: Category;
}
