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

        // Filtrado de especificaciones dinamico
        if (filters.specifications) {
            Object.entries(filters.specifications).forEach(([key, value], index) => {
                // Asegurar que `value` sea un string o array de strings
                if (typeof value !== "string" && !Array.isArray(value)) {
                    throw new Error("Valor de especificación no válido");
                }
        
                // Normalizar clave y valor (manejar arrays si es necesario)
                const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const normalizedValues = Array.isArray(value) 
                    ? value.map(v => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) 
                    : [value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
        
                // Construir condiciones para cada valor
                const conditions = normalizedValues.map((val, valIndex) => 
                    `EXISTS (
                        SELECT 1
                        FROM jsonb_each_text(product.specifications) AS spec
                        WHERE LOWER(TRANSLATE(spec.key, 'áéíóú', 'aeiou')) ILIKE :key${index}
                        AND LOWER(TRANSLATE(spec.value, 'áéíóú', 'aeiou')) ILIKE :value${index}_${valIndex}
                    )`
                ).join(" OR ");
        
                query = query.andWhere(`(${conditions})`, {
                    [`key${index}`]: `%${normalizedKey}%`,
                    ...normalizedValues.reduce((acc, val, valIndex) => ({
                        ...acc,
                        [`value${index}_${valIndex}`]: `%${val}%`
                    }), {})
                });
            });
        }
            
        // Filtrado por "sold_by"
        // Filtrado por "sold_by"
        if (filters.sold_by) {
            const soldByFilters: string[] = Array.isArray(filters.sold_by) ? filters.sold_by : [filters.sold_by];
        
            const includesFalabella = soldByFilters.includes("Falabella");
            const includesHomecenter = soldByFilters.includes("Homecenter");
            const includesMarketplace = soldByFilters.includes("Marketplace");
        
            console.log("Filtros seleccionados:", soldByFilters);
            console.log("Incluye Falabella:", includesFalabella);
            console.log("Incluye Homecenter:", includesHomecenter);
            console.log("Incluye Marketplace:", includesMarketplace);
        
            // Falabella + Homecenter + Marketplace: Incluir todos
            if (includesFalabella && includesHomecenter && includesMarketplace) {
                console.log("Caso: Falabella + Homecenter + Marketplace");
                query = query.andWhere(`product.sold_by IN (:...vendors)`, {
                    vendors: ["Falabella", "Homecenter", "Marketplace"]
                });
            }
            // Falabella + Homecenter: Incluir ambos
            else if (includesFalabella && includesHomecenter) {
                console.log("Caso: Falabella + Homecenter");
                query = query.andWhere(`product.sold_by IN (:...vendors)`, {
                    vendors: ["Falabella", "Homecenter"]
                });
            }
            // Falabella + Marketplace: Incluir Falabella y Marketplace
            else if (includesFalabella && includesMarketplace && !includesHomecenter) {
                console.log("Caso: Falabella + Marketplace");
                query = query.andWhere(
                    `(product.sold_by = 'Falabella' OR product.sold_by NOT IN ('Falabella', 'Homecenter'))`
                );
            }
            // Homecenter + Marketplace: Incluir Homecenter y Marketplace
            else if (includesHomecenter && includesMarketplace && !includesFalabella) {
                console.log("Caso: Homecenter + Marketplace");
                query = query.andWhere(
                    `(product.sold_by = 'Homecenter' OR product.sold_by NOT IN ('Falabella', 'Homecenter'))`
                );
            }
            // Solo Falabella
            else if (includesFalabella) {
                console.log("Caso: Solo Falabella");
                query = query.andWhere(`product.sold_by = 'Falabella'`);
            }
            // Solo Homecenter
            else if (includesHomecenter) {
                console.log("Caso: Solo Homecenter");
                query = query.andWhere(`product.sold_by = 'Homecenter'`);
            }
            // Solo Marketplace: Buscar cualquier tienda que no sea Falabella ni Homecenter
            else if (includesMarketplace) {
                console.log("Caso: Solo Marketplace");
                query = query.andWhere(
                    `product.sold_by NOT IN ('Falabella', 'Homecenter')`
                );
            }
        
            console.log("Consulta generada:", query.getQuery());
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
