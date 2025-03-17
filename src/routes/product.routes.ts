import { Router } from "express";
import { getProductById, getProductsBySection, getProductsByCategory, getProductsBySubcategory, getFilteredProducts } from "../controllers/product.controllers";

const router = Router();

// Obtener producto en especifico (usando Id)
router.get("/product/:id", getProductById);

// Obtener productos por sección (usando Slug)
router.get("/section/:sectionSlug", getProductsBySection);

// Obtener productos por categoría (usando Slug)
router.get("/category/:categorySlug", getProductsByCategory);

// Obtener productos por subcategoría (usando Slug)
router.get("/subcategory/:subcategorySlug", getProductsBySubcategory);

// Filtrar productos por sección
router.post("/section/:sectionSlug", getFilteredProducts);

// Filtrar productos por categoría
router.post("/category/:categorySlug", getFilteredProducts);

// Filtrar productos por subcategoría
router.post("/subcategory/:subcategorySlug", getFilteredProducts);

export default router;
