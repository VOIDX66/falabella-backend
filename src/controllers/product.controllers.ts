import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Product } from "../entities/product";

export const getProductsBySection = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug } = req.params;
        if(AppDataSource.isInitialized){
            console.log("si")
        }
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
        console.error(error)
        return res.status(500).json({ message: "Error al obtener productos por sección" });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { categorySlug } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .where("c.slug = :categorySlug", { categorySlug })
            .getMany();

        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener productos por categoría", error });
    }
};

export const getProductsBySubcategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { subcategorySlug } = req.params; // Ahora recibimos el slug en los parámetros
        console.log(subcategorySlug)
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .where("product.subcategory_slug = :subcategorySlug", { subcategorySlug })
            .getMany();

        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener productos por subcategoría", error });
    }
};

export const getFilteredProducts = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug, categorySlug, subcategorySlug } = req.params;
        const filters = req.body; // El JSON de filtros se envía en el body

        let query = AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section");

        // Aseguramos que los productos pertenezcan a la sección/categoría/subcategoría especificada en la ruta
        if (sectionSlug) query = query.andWhere("sec.slug = :sectionSlug", { sectionSlug });
        if (categorySlug) query = query.andWhere("c.slug = :categorySlug", { categorySlug });
        if (subcategorySlug) query = query.andWhere("sub.slug = :subcategorySlug", { subcategorySlug });

        // Filtrado por precio (mínimo y máximo)
        if (filters.price) {
            query = query.andWhere(
                `COALESCE(product.special_price, product.discount_price, product.price) >= :minPrice`, 
                { minPrice: filters.price.min || 0 }
            );

            if (filters.price.max) {
                query = query.andWhere(
                    `COALESCE(product.special_price, product.discount_price, product.price) <= :maxPrice`, 
                    { maxPrice: filters.price.max }
                );
            }
        }

        // Filtrado por descuento mínimo
        if (filters.discount_percentage?.min) {
            query = query.andWhere(
                `COALESCE(product.special_discount_percentage, product.discount_percentage, 0) >= :minDiscount`,
                { minDiscount: filters.discount_percentage.min }
            );
        }

        // Filtrado por marca
        if (filters.brand) {
            const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
            query = query.andWhere("product.brand IN (:...brands)", { brands });
        }

        // Filtrado por especificaciones dinámicas (JSONB)
        if (filters.specifications) {
            Object.entries(filters.specifications).forEach(([key, value], index) => {
                if (Array.isArray(value) && value.length > 0) {
                    query = query.andWhere(
                        `product.specifications ->> :key${index} IN (:...values${index})`,
                        { [`key${index}`]: key, [`values${index}`]: value }
                    );
                } else {
                    query = query.andWhere(
                        `product.specifications ->> :key${index} = :value${index}`,
                        { [`key${index}`]: key, [`value${index}`]: value }
                    );
                }
            });
        }

        // Filtrado por "sold_by"
        if (filters.sold_by) {
            const soldByFilters = Array.isArray(filters.sold_by) ? filters.sold_by : [filters.sold_by];
        
            const includesFalabella = soldByFilters.includes("Falabella");
            const includesHomecenter = soldByFilters.includes("Homecenter");
            const includesMarketplace = soldByFilters.includes("Marketplace");
        
            if (includesMarketplace && !includesFalabella && !includesHomecenter) {
                // Solo "Marketplace": Excluir Falabella y Homecenter
                query = query.andWhere(`(product.sold_by NOT IN (:...excludedVendors))`, {
                    excludedVendors: ["Falabella", "Homecenter"]
                });
            } else if (!includesMarketplace && (includesFalabella || includesHomecenter)) {
                // Si NO se selecciona "Marketplace", solo incluir los seleccionados
                query = query.andWhere(`(product.sold_by IN (:...vendors))`, {
                    vendors: soldByFilters
                });
            } else if (includesMarketplace && includesFalabella && !includesHomecenter) {
                // Marketplace + Falabella: Incluir ambos, pero excluir Homecenter
                query = query.andWhere(
                    `(product.sold_by = 'Marketplace' OR product.sold_by IN (:...vendors))`,
                    { vendors: ["Falabella"] }
                );
            } else if (includesMarketplace && includesHomecenter && !includesFalabella) {
                // Marketplace + Homecenter: Incluir ambos, pero excluir Falabella
                query = query.andWhere(
                    `(product.sold_by = 'Marketplace' OR product.sold_by IN (:...vendors))`,
                    { vendors: ["Homecenter"] }
                );
            }
        }

        // Filtrado por "rating"
        if (filters.rating) {
            query = query.andWhere(`product.rating >= :minRating`, { minRating: filters.rating });
        }

        console.log(query.getQueryAndParameters());

        // Ejecutar la consulta y devolver los productos
        const products = await query.getMany();
        return res.json(products);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al filtrar productos" });
    }
};
