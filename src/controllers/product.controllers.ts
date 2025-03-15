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

        // 📌 Filtrar por sección, categoría o subcategoría según el parámetro recibido
        if (sectionSlug) query = query.where("sec.slug = :sectionSlug", { sectionSlug });
        if (categorySlug) query = query.where("c.slug = :categorySlug", { categorySlug });
        if (subcategorySlug) query = query.where("sub.slug = :subcategorySlug", { subcategorySlug });

        // 📌 Filtrado por precio (mínimo y máximo) usando el precio con descuento si existe
        if (filters.price) {
            query = query.andWhere("COALESCE(product.discount_price, product.price) >= :minPrice", { 
                minPrice: filters.price.min || 0 
            });

            if (filters.price.max) {
                query = query.andWhere("COALESCE(product.discount_price, product.price) <= :maxPrice", { 
                    maxPrice: filters.price.max 
                });
            }
        }

        // 📌 Filtrado por descuento mínimo
        if (filters.discount_percentage?.min) {
            query = query.andWhere("product.discount_percentage >= :minDiscount", {
                minDiscount: filters.discount_percentage.min
            });
        }

        // 📌 Filtrado por una o varias marcas
        if (filters.brand) {
            const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand];
            query = query.andWhere("product.brand IN (:...brands)", { brands });
        }

        // 📌 Filtrado por especificaciones, permitiendo arrays de opciones
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

        // 📌 Filtrado por "sold_by"
        if (filters.sold_by) {
            const soldByFilters = Array.isArray(filters.sold_by) ? filters.sold_by : [filters.sold_by];

            const includesFalabella = soldByFilters.includes("Falabella");
            const includesHomecenter = soldByFilters.includes("Homecenter");
            const includesMarketplace = soldByFilters.includes("Marketplace");

            if (includesMarketplace && !includesFalabella && !includesHomecenter) {
                // Solo "Marketplace": Excluir Falabella y Homecenter
                query = query.andWhere("product.sold_by NOT IN (:...excludedVendors)", {
                    excludedVendors: ["Falabella", "Homecenter"]
                });
            } else if (!includesMarketplace && (includesFalabella || includesHomecenter)) {
                // Si NO se selecciona "Marketplace", solo incluir los seleccionados
                query = query.andWhere("product.sold_by IN (:...vendors)", {
                    vendors: soldByFilters
                });
            }
            // Si se seleccionan todos, no aplicamos ningún filtro (trae todos).
        }

        const products = await query.getMany();
        return res.json(products);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al filtrar productos" });
    }
};