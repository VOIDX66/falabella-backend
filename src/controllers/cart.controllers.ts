import { Request, Response } from "express";
import { Product } from "../entities/product";
import { Cart } from "../entities/cart";
import { CartProduct } from "../entities/cartproduct";
import { User } from "../entities/user";

// Agregar producto al carrito
export const addProductToCart = async (req: Request, res: Response): Promise<any> => {
  const { userId, productId, quantity } = req.body;

  try {
      // Validar cantidad
      const parsedQuantity = Number(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
          return res.status(400).json({ message: "La cantidad debe ser al menos 1" });
      }

      // Verificar usuario
      const user = await User.findOneBy({ user_id: userId });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      // Obtener carrito
      const cart = await Cart.findOne({ where: { user: { user_id: userId } } });
      if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

      // Verificar producto
      const product = await Product.findOneBy({ id_product: productId });
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });

      // Verificar si ya está en el carrito
      let cartProduct = await CartProduct.findOne({
          where: {
              cart: { id_cart: cart.id_cart },
              product: { id_product: product.id_product }
          }
      });

      if (cartProduct) {
          cartProduct.quantity += parsedQuantity;
      } else {
          cartProduct = CartProduct.create({
              cart,
              product,
              quantity: parsedQuantity
          });
      }

      await cartProduct.save();
      return res.status(200).json({ message: "Producto agregado al carrito correctamente" });

  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al agregar producto al carrito" });
  }
};


// Obtener carrito completo agrupado por tienda
export const getCartByUserId = async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body;

  try {
      // Obtener el usuario por userId
      const user = await User.findOneBy({ user_id: Number(userId) });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      // Obtener el carrito del usuario
      const cart = await Cart.findOneBy({ user: { user_id: user.user_id } });
      if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
  
      // Obtener todos los productos del carrito
      const cartProducts = await CartProduct.find({
          where: { cart: { id_cart: cart.id_cart } },
          relations: ["product"]
      });
  
      if (cartProducts.length === 0) {
          return res.status(200).json({}); // Respuesta vacía si no hay productos
      }
  
      // Crear el objeto en el formato {"id_product": "quantity"}
      const productDetails: Record<number, number> = cartProducts.reduce((acc, cartProduct) => {
          acc[cartProduct.product.id_product] = cartProduct.quantity;
          return acc;
      }, {} as Record<number, number>); // Definir el tipo explícito aquí
  
      // Devolver el objeto con el formato esperado
      return res.status(200).json(productDetails);
  
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener el carrito" });
  }
};





// Eliminar producto del carrito
export const removeProductFromCart = async (req: Request, res: Response) : Promise<any> => {
    const { userId, productId } = req.body;
  
    try {
      // Verificamos usuario
      const user = await User.findOneBy({ user_id: userId });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      // Buscamos el carrito
      const cart = await Cart.findOne({ where: { user: { user_id: userId } } });
      if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
  
      // Buscamos el cartProduct correspondiente
      const cartProduct = await CartProduct.findOne({
        where: {
          cart: { id_cart: cart.id_cart },
          product: { id_product: productId }
        },
        relations: ["cart", "product"]
      });
  
      if (!cartProduct) {
        return res.status(404).json({ message: "Producto no encontrado en el carrito" });
      }
  
      await cartProduct.remove();
      return res.status(200).json({ message: "Producto eliminado del carrito correctamente" });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al eliminar producto del carrito" });
    }
};

// Actualizar cantidad de un producto en el carrito
export const updateProductQuantity = async (req: Request, res: Response) : Promise<any> => {
    const { userId, productId, quantity } = req.body;
  
    try {
      if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({ message: "Cantidad inválida" });
      }
  
      // Verificar usuario
      const user = await User.findOneBy({ user_id: userId });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      // Verificar carrito
      const cart = await Cart.findOne({ where: { user: { user_id: userId } } });
      if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
  
      // Verificar producto
      const product = await Product.findOneBy({ id_product: productId });
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });
  
      // Buscar producto en el carrito
      const cartProduct = await CartProduct.findOne({
        where: {
          cart: { id_cart: cart.id_cart },
          product: { id_product: productId }
        },
        relations: ["cart", "product"]
      });
  
      if (!cartProduct) {
        return res.status(404).json({ message: "Producto no está en el carrito" });
      }
  
      if (quantity === 0) {
        await cartProduct.remove();
        return res.status(200).json({ message: "Producto eliminado del carrito" });
      }
  
      if (quantity > product.stock) {
        return res.status(400).json({ message: "No hay suficiente stock disponible" });
      }
  
      cartProduct.quantity = quantity;
      await cartProduct.save();
  
      return res.status(200).json({ message: "Cantidad actualizada correctamente" });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al actualizar la cantidad del producto" });
    }
};
