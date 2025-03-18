import { Router } from "express";
import { getProductById, getProductsBySection, getProductsByCategory, getProductsBySubcategory, getFilteredProducts } from "../controllers/product.controllers";

const router = Router();

// Obtener producto en especifico (usando Id)
router.get("/product/:id", getProductById);

// Obtener productos por sección (usando Slug)
//router.get("/section/:sectionSlug", getProductsBySection);
router.get("/:sectionSlug", getProductsBySection);

// Obtener productos por categoría (usando Slug)
//router.get("/category/:categorySlug", getProductsByCategory);
router.get("/:sectionSlug/:categorySlug", getProductsByCategory);

// Obtener productos por subcategoría (usando Slug)
//router.get("/subcategory/:subcategorySlug", getProductsBySubcategory);
router.get("/:sectionSlug/:categorySlug/:subcategorySlug", getProductsBySubcategory);

// Filtrar productos por sección
router.post("/:sectionSlug", getFilteredProducts);

// Filtrar productos por categoría
router.post("/:sectionSlug/:categorySlug", getFilteredProducts);

// Filtrar productos por subcategoría
router.post("/:sectionSlug/:categorySlug/:subcategorySlug", getFilteredProducts);

export default router;
