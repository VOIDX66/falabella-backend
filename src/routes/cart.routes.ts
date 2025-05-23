import { Router } from "express";
import {
  addProductToCart,
  getCartByUserId,
  processPayment,
  removeProductFromCart,
  updateProductQuantity
} from "../controllers/cart.controllers";

const router = Router();

// Agregar producto al carrito
router.post("/cart/add_product", addProductToCart); // Recibe userId, productId, quantity

// Obtener carrito por usuario (autenticado)
router.post("/cart", getCartByUserId); // Recibe userId

// Eliminar producto del carrito
router.delete("/cart/remove_product", removeProductFromCart); // Recibe userId, productId

// Actualizar cantidad de un producto
router.put("/cart/update_quantity", updateProductQuantity); // Recibe userId, productId, quantity

router.post("/cart/process_payment", processPayment); // Recibe userId, productId, quantity
export default router;
