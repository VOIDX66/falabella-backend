import { Request, Response } from "express";
import { AppDataSource } from "../db";
import { Product } from "../entities/product";

export const getProductsBySection = async (req: Request, res: Response): Promise<any> => {
    try {
        const { sectionId } = req.params;
        if(AppDataSource.isInitialized){
            console.log("si")
        }
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("category_subcategory", "cs", "product.subcategoryIdSubcategory = cs.subcategoryIdSubcategory")
            .innerJoin("section_category", "sc", "cs.categoryIdCategory = sc.categoryIdCategory")
            .innerJoin("section", "s", "sc.sectionIdSection = s.id_section")
            .where("s.id_section = :sectionId", { sectionId })
            .getMany();

        return res.json(products);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al obtener productos por sección" });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { categoryId } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .innerJoin("category_subcategory", "cs", "product.subcategoryIdSubcategory = cs.subcategoryIdSubcategory")
            .where("cs.categoryIdCategory = :categoryId", { categoryId })
            .getMany();

        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener productos por categoría", error });
    }
};

export const getProductsBySubcategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { subcategoryId } = req.params;
        const products = await AppDataSource.getRepository(Product)
            .createQueryBuilder("product")
            .where("product.subcategoryIdSubcategory = :subcategoryId", { subcategoryId })
            .getMany();

        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener productos por subcategoría", error });
    }
};
