import { Router } from "express";
import { getProductsBySection, getProductsByCategory, getProductsBySubcategory } from "../controllers/product.controllers";

const router = Router();

// Obtener productos por sección (usando ID)
router.get("/section/:sectionId", getProductsBySection);

// Obtener productos por categoría (usando ID)
router.get("/category/:categoryId", getProductsByCategory);

// Obtener productos por subcategoría (usando ID)
router.get("/subcategory/:subcategoryId", getProductsBySubcategory);

export default router;
