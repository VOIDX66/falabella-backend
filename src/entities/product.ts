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
  special_discount_percentage: number | null; // Nuevo campo para otro tipo de descuento

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  special_price: number | null; // Nuevo campo calculado en base al "special_discount_percentage"

  @Column({ type: "jsonb", default: "[]" }) // Almacenar múltiples imágenes
  images: string[];

  @Column({ type: "jsonb", nullable: true })
  specifications: any;

  @Column()
  subcategory_slug: string;

  @Column({ nullable : false })
  sold_by: string; // Campo para "Vendido por"

  @Column("decimal", { precision: 3, scale: 1, default: 0 }) // Calificación de 0 a 5 con decimales
  rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateDiscounts() {
    // Calcular el precio con el primer descuento (discount_price)
    if (this.discount_percentage && this.discount_percentage > 0) {
      // Calculamos el precio con el primer descuento (discount_price)
      this.discount_price = this.price - (this.price * (this.discount_percentage / 100));
  
      // El descuento especial solo se aplica si ya hay un descuento normal
      if (this.special_discount_percentage && this.special_discount_percentage > 0) {
          this.special_price = this.price - (this.price * (this.special_discount_percentage / 100));
      } else {
          this.special_price = null; // Si no hay descuento especial, el precio especial es null
      }
    } else {
        // Si no hay descuento normal, tampoco hay precio con descuento ni precio especial
        this.discount_price = null;
        this.special_price = null;
    }  
  }
}
