import { Router } from "express";
import { getProductsBySection, getProductsByCategory, getProductsBySubcategory, getFilteredProducts } from "../controllers/product.controllers";

const router = Router();

// Obtener productos por sección (usando ID)
router.get("/section/:sectionSlug", getProductsBySection);

// Obtener productos por categoría (usando ID)
router.get("/category/:categorySlug", getProductsByCategory);

// Obtener productos por subcategoría (usando ID)
router.get("/subcategory/:subcategorySlug", getProductsBySubcategory);

// Filtrar productos por sección
router.post("/section/:sectionSlug", getFilteredProducts);

// Filtrar productos por categoría
router.post("/category/:categorySlug", getFilteredProducts);

// Filtrar productos por subcategoría
router.post("/subcategory/:subcategorySlug", getFilteredProducts);

export default router;
