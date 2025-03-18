import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Product } from "../entities/product";

export const getProductById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const product = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .where("product.id_product = :id", { id })
            .getOne();
        
        if (product) return res.json(product);
        return res.status(404).json({ message: "Producto no encontrado" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener producto por ID" });
    }
};

export const getProductsBySection = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .where("sec.slug = :sectionSlug", { sectionSlug })
            .getMany();
        
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por sección" });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<any> => {
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
            .getMany();
        
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por categoría" });
    }
};

export const getProductsBySubcategory = async (req: Request, res: Response): Promise<any> => {
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
            .getMany();
        
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por subcategoría" });
    }
};

export const getFilteredProducts = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug, categorySlug, subcategorySlug } = req.params;
        const filters = req.body; // Filtros desde el body

        let query = AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section");

        // Aplicar filtros de sección, categoría y subcategoría
        if (sectionSlug) query.andWhere("sec.slug = :sectionSlug", { sectionSlug });
        if (categorySlug) query.andWhere("c.slug = :categorySlug", { categorySlug });
        if (subcategorySlug) query.andWhere("sub.slug = :subcategorySlug", { subcategorySlug });

        // Filtros de precio
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

        // Filtrado por porcentaje de descuento
        if (filters.discount_percentage?.min) {
            query.andWhere(
                `COALESCE(product.special_discount_percentage, product.discount_percentage, 0) >= :minDiscount`,
                { minDiscount: filters.discount_percentage.min }
            );
        }

        // Filtrado por marca
        if (filters.brand) {
            const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
            query.andWhere("product.brand IN (:...brands)", { brands });
        }

        // Filtrado dinámico de especificaciones
        if (filters.specifications) {
            Object.entries(filters.specifications).forEach(([key, value], index) => {
                if (typeof value !== "string" && !Array.isArray(value)) {
                    throw new Error("Valor de especificación no válido");
                }
                
                const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
                const normalizedValues = Array.isArray(value)
                    ? value.map(v => v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""))
                    : [value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")];
                
                const conditions = normalizedValues.map((val, valIndex) => 
                    `EXISTS (
                        SELECT 1 FROM jsonb_each_text(product.specifications) AS spec
                        WHERE LOWER(TRANSLATE(spec.key, 'áéíóú', 'aeiou')) ILIKE :key${index}
                        AND LOWER(TRANSLATE(spec.value, 'áéíóú', 'aeiou')) ILIKE :value${index}_${valIndex}
                    )`
                ).join(" OR ");
                
                query.andWhere(`(${conditions})`, {
                    [`key${index}`]: `%${normalizedKey}%`,
                    ...normalizedValues.reduce((acc, val, valIndex) => ({
                        ...acc,
                        [`value${index}_${valIndex}`]: `%${val}%`
                    }), {})
                });
            });
        }
        
        // Filtrado por "sold_by"
        if (filters.sold_by) {
            const soldByFilters: string[] = Array.isArray(filters.sold_by) ? filters.sold_by : [filters.sold_by];
            if (soldByFilters.includes("Marketplace")) {
                query.andWhere(`product.sold_by NOT IN ('Falabella', 'Homecenter')`);
            } else {
                query.andWhere("product.sold_by IN (:...vendors)", { vendors: soldByFilters });
            }
        }

        // Filtrado por "rating"
        if (filters.rating) {
            query.andWhere(`product.rating >= :minRating`, { minRating: filters.rating });
        }

        // Depuración
        console.log(query.getQueryAndParameters());

        // Obtener y devolver los productos filtrados
        const products = await query.getMany();
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al filtrar productos" });
    }
};
