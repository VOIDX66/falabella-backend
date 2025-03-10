import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from "typeorm";
import { Category } from "./category";
import { Subcategory } from "./subcategory";

@Entity()
export class CategorySubcategory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category, { onDelete: "CASCADE" })
    category: Category;

    @ManyToOne(() => Subcategory, { onDelete: "CASCADE" })
    subcategory: Subcategory;
}
