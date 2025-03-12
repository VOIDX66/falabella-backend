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

  @Column({ type: "jsonb", default: "[]" })  // <-- Aquí guardamos múltiples imágenes
  images: string[];

  @Column({ type: "jsonb", nullable: true })
  specifications: any;

  // Almacenar solo el slug de la subcategoría en lugar de la relación
  @Column()
  subcategory_slug: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateDiscountPrice() {
      if (this.discount_percentage && this.discount_percentage > 0) {
          this.discount_price = this.price - (this.price * (this.discount_percentage / 100));
      } else {
          this.discount_price = null;
      }
  }
}
