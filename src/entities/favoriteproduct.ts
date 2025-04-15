import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
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
  
    @ManyToOne(() => FavoriteList, (list) => list.products, {
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: "favorite_list_id" })
    favoriteList: FavoriteList;
  
    @ManyToOne(() => Product, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product: Product;
  
    @Column({ type: "int", default: 1 })
    quantity: number;
  }
  