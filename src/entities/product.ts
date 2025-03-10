import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { Subcategory } from "./subcategory";
  
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
  
    @Column()
    image: string;
  
    @Column({ type: "jsonb", nullable: true })
    specifications: any;
  
    // Relación con Subcategory
    @ManyToOne(() => Subcategory, { nullable: false })
    subcategory: Subcategory;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    /**
     * Calcula el precio con descuento antes de insertar o actualizar
     */
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
  