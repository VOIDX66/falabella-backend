import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Check,
  } from "typeorm";
  import { Product } from "./product";
  import { FavoriteList } from "./favoritelist";
  
  @Entity()
  @Check(`"quantity" >= 1`)
  export class FavoriteProduct extends BaseEntity {
    @PrimaryGeneratedColumn()
    id_favorite_product: number;
  
    @Column()
    quantity: number;
  
    @ManyToOne(() => FavoriteList, (favoriteList) => favoriteList.products, {
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: "id_favorite_list" })
    favoriteList: FavoriteList;
  
    @ManyToOne(() => Product, {
      eager: true,
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: "product_id" })
    product: Product;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }
  