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

  @Column("int") // Ahora en pesos COP sin decimales
  price: number;

  @Column("int", { nullable: true }) // Porcentajes enteros
  discount_percentage: number | null;

  @Column("int", { nullable: true }) // Ahora en pesos COP sin decimales
  discount_price: number | null;

  @Column("int", { nullable: true }) // Porcentajes enteros
  special_discount_percentage: number | null;

  @Column("int", { nullable: true }) // Ahora en pesos COP sin decimales
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

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "int", default: 0 }) // Unidades disponibles
  stock: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateDiscounts() {
    if (this.discount_percentage && this.discount_percentage > 0) {
      this.discount_price = Math.round(
        this.price - (this.price * this.discount_percentage) / 100
      );

      if (this.special_discount_percentage && this.special_discount_percentage > 0) {
        this.special_price = Math.round(
          this.price - (this.price * this.special_discount_percentage) / 100
        );
      } else {
        this.special_price = null;
      }
    } else {
      this.discount_price = null;
      this.special_price = null;
    }
  }
}
