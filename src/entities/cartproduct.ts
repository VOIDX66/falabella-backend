import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    BaseEntity
  } from "typeorm";
  import { Cart } from "./cart";
  import { Product } from "./product";
  
  @Entity()
  export class CartProduct extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Cart, cart => cart.products, { onDelete: "CASCADE" })
    cart: Cart;
  
    @ManyToOne(() => Product)
    product: Product;
  
    @Column({ type: "int", default: 1 })
    quantity: number;
  }
  