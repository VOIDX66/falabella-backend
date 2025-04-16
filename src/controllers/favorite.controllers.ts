import { Request, Response } from "express";
import { FavoriteProduct } from "../entities/favoriteproduct";
import { FavoriteList } from "../entities/favoritelist";
import { Product } from "../entities/product";
import { User } from "../entities/user";
import { AppDataSource } from "../db";

// Crear nueva lista de favoritos
export const createFavoriteList = async (req: Request, res: Response) : Promise<any> => {
    const { userId, name } = req.body;
  
    try {
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "El nombre de la lista es obligatorio" });
      }
  
      const user = await User.findOneBy({ user_id: userId });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      const existing = await FavoriteList.findOne({ where: { user: { user_id: userId }, name } });
      if (existing) return res.status(400).json({ message: "Ya existe una lista con ese nombre" });
  
      const newList = FavoriteList.create({ name, user });
      await newList.save();
  
      return res.status(201).json({ message: "Lista creada correctamente" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al crear la lista" });
    }
};
  
// Editar nombre de una lista
export const renameFavoriteList = async (req: Request, res: Response): Promise<any> => {
    const { userId, listId, newName } = req.body;
  
    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
    
    const user = await User.findOneBy({ user_id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (!listId || isNaN(listId)) {
        return res.status(400).json({ message: "ID de lista inválido" });
    }

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "El nuevo nombre es obligatorio" });
    }
  
    // Verificar si ya existe una lista con el nuevo nombre
    const existing = await FavoriteList.findOne({
      where: {
        user: { user_id: userId },
        name: newName, // Se debe comparar con el nombre, no con `newName`
      },
    });
    if (existing) {
      return res.status(400).json({ message: "Ya existe una lista con ese nombre" });
    }
  
    try {
      const list = await FavoriteList.createQueryBuilder("list")
        .leftJoinAndSelect("list.user", "user")
        .where("list.id_favorite_list = :listId", { listId })
        .andWhere("user.user_id = :userId", { userId })
        .getOne();
  
      if (!list) return res.status(404).json({ message: "Lista no encontrada" });
      if (list.name === "Mis favoritos") {
        return res.status(403).json({ message: "No puedes renombrar la lista 'Mis favoritos'" });
      }
  
      list.name = newName;
      await list.save();
  
      return res.status(200).json({ message: "Nombre actualizado"});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al renombrar la lista" });
    }
};
  
export const deleteFavoriteList = async (req: Request, res: Response): Promise<any> => {
    const { userId, listId } = req.body;
  
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const user = await User.findOneBy({ user_id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
    if (!listId || isNaN(listId)) {
      return res.status(400).json({ message: "ID de lista inválido" });
    }
  
    try {
      const list = await FavoriteList.createQueryBuilder("list")
        .leftJoinAndSelect("list.user", "user")
        .where("list.id_favorite_list = :listId", { listId })
        .andWhere("user.user_id = :userId", { userId })
        .getOne();
  
      if (!list) return res.status(404).json({ message: "Lista no encontrada" });
  
      if (list.name === "Mis favoritos") {
        return res.status(403).json({ message: "No puedes eliminar la lista 'Mis favoritos'" });
      }
  
      await list.remove();
      return res.status(200).json({ message: "Lista eliminada correctamente" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al eliminar la lista" });
    }
};
  
export const addProductToFavoriteLists = async (req: Request, res: Response): Promise<any> => {
    const { userId, listIds, productId } = req.body;
  
    try {
      // 1. Verificar que el ID del usuario es válido
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario no válido" });
      }
  
      // 2. Verificar que el usuario existe
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      // 3. Verificar que el ID del producto es válido
      if (!productId || isNaN(productId)) {
        return res.status(400).json({ message: "ID de producto no válido" });
      }
  
      // 4. Verificar que el producto existe
      const product = await Product.findOne({
        where: {
          id_product: productId, // Usando el ID del producto correcto
        },
      });
  
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
  
      // 5. Verificar que el producto tiene stock
      if (product.stock <= 0) {
        return res.status(400).json({ message: "Producto sin stock disponible" });
      }
  
      // 6. Verificar que listIds es un array de IDs válidos
      if (!Array.isArray(listIds) || listIds.some(id => isNaN(id))) {
        return res.status(400).json({ message: "Lista de IDs no válida" });
      }
  
      // 7. Inicializar arrays para respuestas
      const addedLists: string[] = [];
      const notFoundLists: string[] = [];
  
      // 8. Iterar sobre todas las listas proporcionadas
      for (const listId of listIds) {
        // Verificar que la lista de favoritos existe y pertenece al usuario
        const favoriteList = await FavoriteList.findOne({
          where: {
            id_favorite_list: listId,
            user: { user_id: userId }, // Relación con el usuario
          },
        });
  
        if (!favoriteList) {
          // Si no se encuentra la lista, agregar al array de "no encontrada"
          notFoundLists.push(`Lista ${listId}`);
        } else {
          // Verificar si el producto ya está en la lista de favoritos
          const existingFavorite = await FavoriteProduct.findOne({
            where: {
              product: { id_product: productId },
              favoriteList: { id_favorite_list: listId },
            },
          });
  
          if (existingFavorite) {
            // Si ya existe el producto, agregamos al array de "ya agregado"
            notFoundLists.push(`Producto ya está en la lista ${listId}`);
          } else {
            // Crear una nueva relación de producto en la lista de favoritos
            const favoriteProduct = new FavoriteProduct();
            favoriteProduct.favoriteList = favoriteList;
            favoriteProduct.product = product;
            favoriteProduct.quantity = 1; // Inicializamos con cantidad 1
  
            await favoriteProduct.save();
            addedLists.push(`Lista ${listId}`);
          }
        }
      }
  
      // 9. Retornar el resultado
      if (addedLists.length > 0 || notFoundLists.length > 0) {
        return res.status(200).json({
          message: "Proceso completado",
          addedToLists: addedLists,
          alreadyInLists: notFoundLists,
        });
      } else {
        return res.status(404).json({ message: "El producto no se pudo agregar a ninguna lista" });
      }
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al agregar producto a las listas de favoritos" });
    }
};

export const updateFavoriteProductQuantity = async (req: Request, res: Response): Promise<any> => {
    const { userId, listId, productId, quantity } = req.body;
  
    // Validar que quantity sea número y válido
    if (!Number.isInteger(Number(quantity)) || quantity < 1) {
      return res.status(400).json({ message: "Cantidad inválida. Debe ser un número entero mayor o igual a 1." });
    }
  
    try {
      // Validar existencia de usuario
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      // Validar existencia de la lista
      const favoriteList = await FavoriteList.findOne({
        where: { id_favorite_list: listId, user: { user_id: userId } },
      });
      if (!favoriteList) return res.status(404).json({ message: "Lista de favoritos no encontrada o no pertenece al usuario" });
  
      // Validar existencia del producto
      const product = await Product.findOne({ where: { id_product: productId } });
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
  
      // Validar stock
      if (quantity > product.stock) {
        return res.status(400).json({ message: "La cantidad no puede superar el stock disponible" });
      }
  
      // Validar existencia de la relación en la lista
      const favoriteProduct = await FavoriteProduct.findOne({
        where: {
          favoriteList: { id_favorite_list: listId },
          product: { id_product: productId },
        },
      });
  
      if (!favoriteProduct) {
        return res.status(404).json({ message: "Producto no está en la lista de favoritos" });
      }
  
      // Actualizar cantidad sin tocar `created_at`
      await AppDataSource.getRepository(FavoriteProduct).update(
        { id_favorite_product: favoriteProduct.id_favorite_product },
        { quantity }
      );
  
      return res.status(200).json({ message: "Cantidad actualizada correctamente" });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al actualizar la cantidad del producto en favoritos" });
    }
};

export const deleteProductFromFavoriteLists = async (req: Request, res: Response) : Promise<any> => {
    try {
      const { userId, listIds, productId } = req.body;
  
      // 1. Validar que los IDs sean válidos
      if (!Number.isInteger(Number(userId))) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
      if (!Array.isArray(listIds) || listIds.some(id => !Number.isInteger(Number(id)))) {
        return res.status(400).json({ message: "IDs de lista inválidos" });
      }
      if (!Number.isInteger(Number(productId))) {
        return res.status(400).json({ message: "ID de producto inválido" });
      }
  
      // 2. Validar existencia del usuario
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      // 3. Validar existencia del producto
      const product = await Product.findOne({ where: { id_product: productId } });
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
  
      // 4. Inicializar un array para los mensajes de eliminación
      const removedLists: string[] = [];
      const notFoundInLists: string[] = [];
  
      // 5. Iterar sobre todas las listas que se enviaron
      for (const listId of listIds) {
        // 6. Validar existencia de la lista y que pertenezca al usuario
        const list = await FavoriteList.findOne({
          where: { id_favorite_list: listId, user: { user_id: userId } },
        });
        if (!list) {
          return res.status(404).json({ message: `Lista con ID ${listId} no encontrada o no pertenece al usuario` });
        }
  
        // 7. Buscar el producto en la lista de favoritos
        const favoriteProduct = await FavoriteProduct.findOne({
          where: {
            favoriteList: { id_favorite_list: listId },
            product: { id_product: productId },
          },
          relations: ["favoriteList", "product"],
        });
  
        if (!favoriteProduct) {
          // Si no se encuentra el producto en la lista, agregar al array de "no encontrado"
          notFoundInLists.push(`Lista ${listId}`);
        } else {
          // Eliminar el producto de la lista de favoritos
          await favoriteProduct.remove();
          removedLists.push(`Lista ${listId}`);
        }
      }
  
      // 8. Retornar el resultado
      if (removedLists.length > 0 || notFoundInLists.length > 0) {
        return res.status(200).json({
          message: "Proceso completado",
          removedFromLists: removedLists,
          notFoundInLists: notFoundInLists,
        });
      } else {
        return res.status(404).json({ message: "Producto no encontrado en ninguna de las listas seleccionadas" });
      }
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al eliminar el producto de las listas" });
    }
};

export const getFavoriteListsByUser = async (req: Request, res: Response): Promise<any> => {
    const { userId, productId } = req.body;
  
    try {
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario no válido" });
      }
  
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      const favoriteLists = await FavoriteList.find({
        where: { user: { user_id: userId } },
        relations: ["products", "products.product"],
        order: { id_favorite_list: "ASC" },
      });
  
      let productInLists: number[] = [];
  
      const showIsInList = productId && !isNaN(productId);
      const showPreviewImages = !productId;
  
      if (showIsInList) {
        const entries = await FavoriteProduct.find({
          where: {
            favoriteList: { user: { user_id: userId } },
            product: { id_product: productId },
          },
          relations: ["favoriteList"],
        });
  
        productInLists = entries.map(entry => entry.favoriteList.id_favorite_list);
      }
  
      const result = favoriteLists.map((list) => {
        const base: any = {
          id_favorite_list: list.id_favorite_list,
          name: list.name,
        };
  
        if (showIsInList) {
          base.isInList = productInLists.includes(list.id_favorite_list);
        }
  
        if (showPreviewImages) {
          base.previewImages = list.products
            .slice(0, 10)
            .map(fp => fp.product.images?.[0] || null)
            .filter(Boolean);
        }
  
        return base;
      });
  
      return res.status(200).json(result);
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener listas de favoritos del usuario" });
    }
};

export const getFavoriteListDetails = async (req: Request, res: Response): Promise<any> => {
    const { userId, listId } = req.body;
  
    try {
      if (!userId || isNaN(Number(userId))) {
        return res.status(400).json({ message: "ID de usuario no válido" });
      }
  
      if (!listId || isNaN(Number(listId))) {
        return res.status(400).json({ message: "ID de lista no válido" });
      }
  
      const favoriteList = await FavoriteList.findOne({
        where: {
          id_favorite_list: Number(listId),
          user: { user_id: Number(userId) },
        },
        relations: ["products", "products.product"],
      });
  
      if (!favoriteList) {
        return res.status(404).json({ message: "Lista no encontrada o no pertenece al usuario" });
      }
  
      const products = favoriteList.products.map((favProduct) => {
        const p = favProduct.product;
        return {
          id_product: p.id_product,
          brand: p.brand,
          title: p.title,
          price: p.price,
          discount_percentage: p.discount_percentage,
          discount_price: p.discount_price,
          special_discount_percentage: p.special_discount_percentage,
          special_price: p.special_price,
          image: p.images?.[0] || null,
          quantity: favProduct.quantity,
        };
      });
  
      return res.status(200).json({
        listId: favoriteList.id_favorite_list,
        name: favoriteList.name,
        products,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener la lista de favoritos" });
    }
};
  