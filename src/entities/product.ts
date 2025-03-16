import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id_product: number;

  @Column()
  brand: string;

  @Column()
  title: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  discount_percentage: number | null;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  discount_price: number | null;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  special_discount_percentage: number | null;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  special_price: number | null;

  @Column({ type: "jsonb", default: "[]" })
  images: string[];

  @Column({ type: "jsonb", nullable: true })
  specifications: any;

  @Column()
  subcategory_slug: string;

  @Column({ nullable: false })
  sold_by: string;

  @Column("decimal", { precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: "text", nullable: true }) // Campo para información adicional extensa
  description: string | null;

  @Column({ type: "int", default: 0 }) // Campo para unidades disponibles
  stock: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateDiscounts() {
    if (this.discount_percentage && this.discount_percentage > 0) {
      this.discount_price = this.price - (this.price * (this.discount_percentage / 100));

      if (this.special_discount_percentage && this.special_discount_percentage > 0) {
        this.special_price = this.price - (this.price * (this.special_discount_percentage / 100));
      } else {
        this.special_price = null;
      }
    } else {
      this.discount_price = null;
      this.special_price = null;
    }
  }
}
