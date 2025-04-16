import { Router } from "express";
import {
    createFavoriteList,
    renameFavoriteList,
    deleteFavoriteList,
    addProductToFavoriteLists,
    updateFavoriteProductQuantity,
    deleteProductFromFavoriteLists,
    getFavoriteListsByUser,
    getFavoriteListDetails
} from "../controllers/favorite.controllers";

const router = Router();

// Agregar producto al carrito
router.post("/favorite/create_list", createFavoriteList); // Recibe userId, name( Nombre de la lista )
router.put("/favorite/rename_list", renameFavoriteList); // Recibe userId, listId, newName
router.delete("/favorite/delete_list", deleteFavoriteList); // Recibre userId, listId
router.post("/favorite/add_product_to_list", addProductToFavoriteLists); // Recibe userId, listIds (Array[]), productId
router.put("/favorite/update_quantity_product_list", updateFavoriteProductQuantity); // Recibe userId, productId, listId, quantity
router.delete("/favorite/delete_product_from_lists", deleteProductFromFavoriteLists); // Recibe userId, listIds (Array []), productId
router.post("/favorite/get_favorite_lists", getFavoriteListsByUser); // Recibe userId y de manera opcional productId
router.post("/favorite/get_favorite_list_details", getFavoriteListDetails); // Recibe userId, listId

export default router;