import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Product } from "../entities/product";
import { User } from "../entities/user";
import { FavoriteProduct } from "../entities/favoriteproduct";

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
export const getProductById = async (req: Request, res: Response): Promise<any> => {
    try {
      // Obtener el ID del producto desde los parámetros y el ID del usuario desde el cuerpo de la solicitud
      const { id } = req.params;
      const userId = req.body.userId; // Suponiendo que el ID del usuario se obtiene del token o sesión
        
      console.log(userId)

      // Validación del ID del producto
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de producto no válido" });
      }
  
      // Obtener el producto por ID con las uniones necesarias
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
  
      // Inicializar el campo is_favorite como false
      let isFavorite = false;
  
      // Verificar si el usuario está autenticado y si el producto está en la lista de favoritos
      if (userId) {
        
        const favorite = await FavoriteProduct.findOne({
          where: {
            product: { id_product: Number(id) }, // Asegurarse de que el ID del producto sea correcto
            favoriteList: { user: { user_id: userId } }, // Validar la relación con el usuario
          },
        });
  
        isFavorite = !!favorite; // Si existe un registro en FavoriteProduct, es un favorito
      }
  
      // Limpiar la estructura del producto y agregar el campo is_favorite
      const cleanedProduct = cleanProductKeys([product])[0];
      cleanedProduct.is_favorite = isFavorite;
  
      // Devolver el producto con el campo is_favorite
      return res.json(cleanedProduct); // Limpiar prefijos y agregar el campo is_favorite
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener producto por ID" });
    }
  };

// Obtener productos por sección
export const getProductsBySection = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug } = req.params;

        // 1. Obtener info de la sección
        const section = await AppDataSource.getRepository("section")
            .createQueryBuilder("section")
            .select(["section.name_section", "section.banner_image", "section.id_section"])
            .where("section.slug = :sectionSlug", { sectionSlug })
            .getOne();

        if (!section) {
            return res.status(404).json({ message: "Sección no encontrada" });
        }

        const sectionId = section.id_section;

        // 2. Obtener productos asociados a la sección
        const products_uc = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .distinct(true)
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .where("sec.slug = :sectionSlug", { sectionSlug })
            .addSelect(["sub.slug AS category_slug", "sec.slug AS section_slug"])
            .getRawMany();

        // 3. Obtener destacados: hasta 5 categorías de la sección con 1 imagen representativa de producto
        const featured = await AppDataSource.getRepository(Product)
            .createQueryBuilder("featured")
            .select([
                "category.name_category AS name",
                "category.slug AS slug",
                "featured.images[0] AS image"
            ])
            .innerJoin("subcategory", "sub", "featured.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "category", "cs.categoryIdCategory = category.id_category")
            .innerJoin("section_category", "sc", "category.id_category = sc.categoryIdCategory")
            .where("sc.sectionIdSection = :sectionId", { sectionId })
            .andWhere("jsonb_array_length(featured.images) > 0")
            .groupBy("category.id_category, featured.id_product")
            .distinctOn(["category.id_category"])
            .orderBy("category.id_category", "ASC")
            .limit(5)
            .getRawMany();

        // 4. Respuesta
        return res.json({
            info: {
                name: section.name_section,
                banner: section.banner_image,
                featured: featured.map(f => ({
                    name: f.name,
                    slug: f.slug,
                    image: f.image
                }))
            },
            products: cleanProductKeys(products_uc),
        });

    } catch (error) {
        console.error("Error en getProductsBySection:", error);
        return res.status(500).json({ message: "Error al obtener productos por sección" });
    }
};


// Obtener productos por categoría
// Obtener productos por categoría
export const getProductsByCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug, categorySlug } = req.params;

        // 1. Obtener información de la categoría
        const category = await AppDataSource.getRepository("category")
            .createQueryBuilder("c")
            .select(["c.name_category", "c.banner_image", "c.id_category"])
            .where("c.slug = :categorySlug", { categorySlug })
            .getOne();

        if (!category) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        const categoryId = category.id_category;

        // 2. Obtener productos de esa categoría (evitar duplicados)
        const productsRaw = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .distinct(true)
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "sec", "sc.sectionIdSection = sec.id_section")
            .where("sec.slug = :sectionSlug", { sectionSlug })
            .andWhere("c.slug = :categorySlug", { categorySlug })
            .addSelect(["sub.slug AS category_slug", "sec.slug AS section_slug"])
            .getRawMany();

        // Filtro extra por si acaso se duplican aún
        const seen = new Set();
        const products = productsRaw.filter(p => {
            if (seen.has(p.product_id_product)) return false;
            seen.add(p.product_id_product);
            return true;
        });

        // 3. Obtener destacados: hasta 5 subcategorías con una imagen representativa
        const featured = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .select([
                "sub.name_subcategory AS name",
                "sub.slug AS slug",
                "product.images[1] AS image"
            ])
            .innerJoin("subcategory", "sub", "product.subcategory_slug = sub.slug")
            .innerJoin("category_subcategory", "cs", "sub.id_subcategory = cs.subcategoryIdSubcategory")
            .innerJoin("category", "c", "cs.categoryIdCategory = c.id_category")
            .where("c.id_category = :categoryId", { categoryId })
            .andWhere("jsonb_array_length(product.images) > 0")
            .groupBy("sub.id_subcategory, product.id_product")
            .distinctOn(["sub.id_subcategory"])
            .orderBy("sub.id_subcategory", "ASC")
            .limit(5)
            .getRawMany();

        // 4. Enviar respuesta estructurada
        return res.json({
            info: {
                name: category.name_category,
                banner: category.banner_image,
                featured: featured.map(f => ({
                    name: f.name,
                    slug: f.slug,
                    image: f.image
                }))
            },
            products: cleanProductKeys(products)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener productos por categoría" });
    }
};


// Obtener productos por subcategoría
export const getProductsBySubcategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionSlug, categorySlug, subcategorySlug } = req.params;

        // 1. Obtener productos por subcategoría
        const productsRaw = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .distinct(true)
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

        // Filtro extra por si acaso se duplican productos
        const seen = new Set();
        const products = productsRaw.filter(p => {
            if (seen.has(p.product_id_product)) return false;
            seen.add(p.product_id_product);
            return true;
        });

        // 2. Enviar respuesta con datos organizados (sin banner ni destacados por el momento)
        return res.json({
            info: {
                name: null,  // No hay banner ni destacados para este endpoint
                banner: null,  // Mantén null por si quieres agregarlo más adelante
                featured: null,  // Mantén null por si quieres agregarlo más adelante
            },
            products: cleanProductKeys(products)
        });

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

        if (filters.rating && typeof filters.rating === "object") {
            const minRating = parseFloat(filters.rating.minRating || "0");
            query.andWhere(`product.rating >= :minRating`, { minRating });
        }        

        if (filters.sold_by) {
            const soldByFilters: string[] = Array.isArray(filters.sold_by) ? filters.sold_by : [filters.sold_by];
        
            // Agregar mas tiendas oficiales de ser necesario
            const knownStores = ["Falabella", "Homecenter"];
            const conditions: string[] = [];
        
            for (const store of knownStores) {
                if (soldByFilters.includes(store)) {
                    conditions.push(`product.sold_by = '${store}'`);
                }
            }
        
            // Si incluye Marketplace, agregamos condición para tiendas no oficiales
            if (soldByFilters.includes("Marketplace")) {
                conditions.push(`product.sold_by NOT IN (${knownStores.map(s => `'${s}'`).join(", ")})`);
            }
        
            if (conditions.length) {
                query = query.andWhere(`(${conditions.join(" OR ")})`);
            }
        }
        
        
        // Filtros dinámicos en specifications
        if (filters.specifications && typeof filters.specifications === "object") {
            const specifications = filters.specifications as Record<string, string>;
        
            Object.entries(specifications).forEach(([key, value], index) => {
                const numericPart = value.toString().replace(/\D/g, "");
                const isNumeric = /^\d+$/.test(numericPart);
        
                if (isNumeric) {
                    query.andWhere(`
                        EXISTS (
                            SELECT 1
                            FROM jsonb_each_text(product.specifications) AS kv(key, value)
                            WHERE kv.key ILIKE :key${index}
                              AND regexp_replace(kv.value, '\\D', '', 'g') <> ''
                              AND regexp_replace(kv.value, '\\D', '', 'g')::int = :value${index}
                        )
                    `, {
                        [`key${index}`]: `%${key}%`,
                        [`value${index}`]: parseInt(numericPart, 10)
                    });
                } else {
                    query.andWhere(`
                        EXISTS (
                            SELECT 1
                            FROM jsonb_each_text(product.specifications) AS kv(key, value)
                            WHERE kv.key ILIKE :key${index}
                              AND kv.value ILIKE :value${index}
                        )
                    `, {
                        [`key${index}`]: `%${key}%`,
                        [`value${index}`]: `%${value}%`
                    });
                }
            });
        }
        
        

        console.log(query.getQueryAndParameters());

        const products = await query.getRawMany();
        return res.json(cleanProductKeys(products));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al filtrar productos" });
    }
};
