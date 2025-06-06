import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/user";
import { Category } from "./entities/category";
import { Section } from "./entities/section";
import { Subcategory } from "./entities/subcategory";
import { SectionCategory } from "./entities/sectioncategory";
import { CategorySubcategory } from "./entities/categorysubcategory";
import { Product } from "./entities/product";
import { Cart } from "./entities/cart";
import { CartProduct } from "./entities/cartproduct";
import { FavoriteList } from "./entities/favoritelist";
import { FavoriteProduct } from "./entities/favoriteproduct";
import { ProductReview } from "./entities/comment";
import { UserVote } from "./entities/vote";
import { Address } from "./entities/address";
import { Order } from "./entities/order";
import { OrderProduct } from "./entities/orderproduct";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // Render requiere SSL
  entities: [
    User,
    Section,
    Category,
    Subcategory,
    SectionCategory,
    CategorySubcategory,
    Product,
    Cart,
    CartProduct,
    FavoriteList,
    FavoriteProduct,
    ProductReview,
    UserVote,
    Address,
    Order,
    OrderProduct
  ],
  logging: false,
  synchronize: true,
});
