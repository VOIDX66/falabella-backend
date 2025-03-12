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

