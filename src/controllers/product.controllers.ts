import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Product } from "../entities/product";

// Función auxiliar para limpiar los prefijos "product_"
const cleanProductKeys = (products: any[]) => {
    return products.map(product =>
        Object.fromEntries(
            Object.entries(product).map(([key, value]) => [
                key.replace(/^product_/, ""), // Elimina el prefijo "product_"
                value
            ])
        )
    );
};

// Obtener producto por ID
export const getProductById = async (req: Request, res: Response) : Promise<any> => {
    try {
        const { id } = req.params;
        const product = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .where("product.id_product = :id", { id })
            .addSelect(["sub.slug AS category_slug", "sec.slug AS section_slug"])
            .leftJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .leftJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .leftJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .leftJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .getRawOne();
        
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        return res.json(cleanProductKeys([product])[0]); // Limpiar prefijos antes de enviar
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener producto por ID" });
    }
};

// Obtener productos por sección
export const getProductsBySection = async (req: Request, res: Response) : Promise<any> => {
    try {
        const { sectionSlug } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .where("sec.slug = :sectionSlug", { sectionSlug })
            .addSelect(["sub.slug AS category_slug", "sec.slug AS section_slug"])
            .getRawMany();

        return res.json(cleanProductKeys(products));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por sección" });
    }
};

// Obtener productos por categoría
export const getProductsByCategory = async (req: Request, res: Response) : Promise<any> => {
    try {
        const { sectionSlug, categorySlug } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .where("sec.slug = :sectionSlug", { sectionSlug })
            .andWhere("c.slug = :categorySlug", { categorySlug })
            .addSelect(["c.slug AS category_slug", "sec.slug AS section_slug"])
            .getRawMany();

        return res.json(cleanProductKeys(products));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por categoría" });
    }
};

// Obtener productos por subcategoría
export const getProductsBySubcategory = async (req: Request, res: Response) : Promise<any> => {
    try {
        const { sectionSlug, categorySlug, subcategorySlug } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .where("sec.slug = :sectionSlug", { sectionSlug })
            .andWhere("c.slug = :categorySlug", { categorySlug })
            .andWhere("sub.slug = :subcategorySlug", { subcategorySlug })
            .addSelect(["c.slug AS category_slug", "sec.slug AS section_slug"])
            .getRawMany();

        return res.json(cleanProductKeys(products));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por subcategoría" });
    }
};

// Obtener productos filtrados
export const getFilteredProducts = async (req: Request, res: Response) : Promise<any> => {
    try {
        const { sectionSlug, categorySlug, subcategorySlug } = req.params;
        const filters = req.body;

        let query = AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .addSelect(["c.slug AS category_slug", "sec.slug AS section_slug"]);

        if (sectionSlug) query.andWhere("sec.slug = :sectionSlug", { sectionSlug });
        if (categorySlug) query.andWhere("c.slug = :categorySlug", { categorySlug });
        if (subcategorySlug) query.andWhere("sub.slug = :subcategorySlug", { subcategorySlug });

        if (filters.price) {
            query.andWhere(
                `COALESCE(product.special_price, product.discount_price, product.price) >= :minPrice`,
                { minPrice: filters.price.min || 0 }
            );
            if (filters.price.max) {
                query.andWhere(
                    `COALESCE(product.special_price, product.discount_price, product.price) <= :maxPrice`,
                    { maxPrice: filters.price.max }
                );
            }
        }

        if (filters.brand) {
            const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
            query.andWhere("product.brand IN (:...brands)", { brands });
        }

        if (filters.rating) {
            query.andWhere(`product.rating >= :minRating`, { minRating: filters.rating });
        }

        console.log(query.getQueryAndParameters());

        const products = await query.getRawMany();
        return res.json(cleanProductKeys(products));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al filtrar productos" });
    }
};
