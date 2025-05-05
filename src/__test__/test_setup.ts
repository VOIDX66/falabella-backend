import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "../entities/user";
import { Category } from "../entities/category";
import { Section } from "../entities/section";
import { Subcategory } from "../entities/subcategory";
import { SectionCategory } from "../entities/sectioncategory";
import { CategorySubcategory } from "../entities/categorysubcategory";
import { Product } from "../entities/product";
import { Cart } from "../entities/cart";
import { CartProduct } from "../entities/cartproduct";
import { FavoriteList } from "../entities/favoritelist";
import { FavoriteProduct } from "../entities/favoriteproduct";

// Cargar las variables de entorno
dotenv.config();

// Determinar si estamos en producción o en pruebas
const isTest = process.env.ENV_NODE === "dev"; // Puedes ajustar esta línea si usas otro valor para el entorno

if (!isTest) {
    console.log("No se pueden ejecutar pruebas en producción.");
    process.exit(1);
}

// Crear el DataSource para la base de datos
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    // Puedes añadir ssl: { rejectUnauthorized: false } si usas Render o similares
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
        FavoriteProduct
    ],
    logging: false,
    synchronize: isTest, // Solo sincronizar en entorno de pruebas
});

// Función para inicializar la base de datos en pruebas
export const initializeDatabase = async () => {
    if (isTest) {
        await AppDataSource.initialize();
        
        console.log("In-memory (test) database initialized...");
    }
};

// Función para limpiar la base de datos antes de cada prueba
export const cleanDatabase = async () => {
    if (isTest) {
        await AppDataSource.dropDatabase();  // Borra la base de datos de prueba
        await AppDataSource.synchronize(true); // Vuelve a crear las tablas
        console.log("Test database cleaned...");
    }
};
