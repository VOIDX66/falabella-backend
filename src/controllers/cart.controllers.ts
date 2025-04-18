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
        if (product.stock <= 0) return res.status(400).json({ message: "Producto sin stock" });
    
        // Verificar si ya está en el carrito
        let cartProduct = await CartProduct.findOne({
            where: {
            cart: { id_cart: cart.id_cart },
            product: { id_product: product.id_product }
            }
        });
    
        if (cartProduct) {
            const totalQuantity = cartProduct.quantity + parsedQuantity;
            if (totalQuantity > product.stock) {
            return res.status(400).json({
                message: `Solo hay ${product.stock - cartProduct.quantity} unidades disponibles para agregar`
            });
            }
            cartProduct.quantity = totalQuantity;
        } else {
            if (parsedQuantity > product.stock) {
            return res.status(400).json({
                message: `Solo hay ${product.stock} unidades disponibles`
            });
            }
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
    const { userId, selectedProductsByStore } = req.body;
  
    try {
      const user = await User.findOneBy({ user_id: Number(userId) });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      const cart = await Cart.findOneBy({ user: { user_id: user.user_id } });
      if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
  
      const cartProducts = await CartProduct.find({
        where: { cart: { id_cart: cart.id_cart } },
        relations: ["product"]
      });
  
      if (cartProducts.length === 0) {
        return res.status(200).json({ message: "El carrito está vacío", data: {} });
      }
  
      const groupedByStore: Record<string, any[]> = {
        Falabella: [],
        Homecenter: [],
        Marketplace: []
      };
  
      let totalBase = 0;
      let totalDiscount = 0;
      let totalSpecial = 0;
  
      for (const cartProduct of cartProducts) {
        const { product, quantity } = cartProduct;
        const soldBy = ["Falabella", "Homecenter"].includes(product.sold_by)
          ? product.sold_by
          : "Marketplace";
  
        const isSelected =
          !selectedProductsByStore || // no se envió => todo seleccionado
          (selectedProductsByStore[soldBy] &&
            selectedProductsByStore[soldBy].includes(product.id_product));
  
        groupedByStore[soldBy].push({
          productId: product.id_product,
          title: product.title,
          brand: product.brand,
          price: product.price,
          discount_price: product.discount_price,
          special_price: product.special_price,
          quantity,
          stock: product.stock,
          image: product.images[0] ?? null,
          selected: isSelected
        });
  
        if (isSelected) {
          totalBase += product.price * quantity;
          totalDiscount += (product.discount_price ?? product.price) * quantity;
          totalSpecial += (product.special_price ?? product.discount_price ?? product.price) * quantity;
        }
      }
  
      return res.status(200).json({
        data: groupedByStore,
        totals: {
          base: totalBase,
          discount: totalDiscount,
          special: totalSpecial
        }
      });
  
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
