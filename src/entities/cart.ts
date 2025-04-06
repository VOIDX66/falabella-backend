import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
  } from "typeorm";
  import { User } from "./user";
  import { CartProduct } from "./cartproduct";
  
  @Entity()
  export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn()
    id_cart: number;
  
    @OneToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;
  
    @OneToMany(() => CartProduct, cartProduct => cartProduct.cart, { cascade: true })
    products: CartProduct[];
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  