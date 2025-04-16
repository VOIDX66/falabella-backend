import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user";
import { FavoriteProduct } from "./favoriteproduct";

@Entity()
export class FavoriteList extends BaseEntity {
  @PrimaryGeneratedColumn()
  id_favorite_list: number;

  @Column()
  name: string;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => FavoriteProduct, (favoriteProduct) => favoriteProduct.favoriteList, {
    cascade: true,
  })
  products: FavoriteProduct[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
