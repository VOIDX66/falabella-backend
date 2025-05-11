import { Request, Response } from "express";
import { Product } from "../entities/product";
import { Cart } from "../entities/cart";
import { CartProduct } from "../entities/cartproduct";
import { User } from "../entities/user";
import { Order } from "../entities/order";
import { OrderProduct } from "../entities/orderproduct";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { MailerSend, EmailParams, Recipient, Sender } from 'mailersend';

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

const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY! });

const sendPaymentSuccessEmail = async (email: string, items: any[], amount: number) => {
  const emailParams = new EmailParams();
  emailParams.from = new Sender("MS_hLkhHc@test-y7zpl98ezk045vx6.mlsender.net", "Falabella(dev)");
  emailParams.to = [new Recipient(email, "Usuario")];
  emailParams.subject = "¡Pago aprobado! Aquí tienes tu comprobante";

  const itemRows = items.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>${item.quantity}</td>
      <td>$${item.unit_price.toLocaleString('es-CO')}</td>
    </tr>`).join("");

  emailParams.html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: green;">✅ Tu pago fue aprobado</h2>
    <p>Gracias por tu compra. Aquí tienes el resumen:</p>
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio unitario</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    <p style="margin-top: 20px;"><strong>Total pagado:</strong> $${amount.toLocaleString('es-CO')}</p>
    <p>Este correo funciona como comprobante de pago.</p>
  </div>
  `;
  await mailerSend.email.send(emailParams);
};

const sendPaymentFailureEmail = async (email: string, reason: string) => {
  const emailParams = new EmailParams();
  emailParams.from = new Sender("MS_hLkhHc@test-y7zpl98ezk045vx6.mlsender.net", "Falabella(dev)");
  emailParams.to = [new Recipient(email, "Usuario")];
  emailParams.subject = "❌ Pago rechazado";

  emailParams.html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: red;">Hubo un problema con tu pago</h2>
    <p>Motivo: <strong>${reason}</strong></p>
    <p>Por favor, intenta de nuevo o usa otro método de pago.</p>
  </div>
  `;
  await mailerSend.email.send(emailParams);
};


const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const payment = new Payment(mp);

export const processPayment = async (req: Request, res: Response): Promise<any> => {
  const { products, token, tipo, precio_total, user_id } = req.body;
  const errors: { field: string; message: string }[] = [];

  if (!products || typeof products !== "object" || Object.keys(products).length === 0) {
    errors.push({ field: "products", message: "Se requieren productos válidos para procesar el pago." });
  }
  if (!token) errors.push({ field: "token", message: "Token de la tarjeta requerido." });
  if (!tipo) errors.push({ field: "tipo", message: "Tipo de tarjeta requerido." });
  if (!precio_total) errors.push({ field: "precio_total", message: "Precio total requerido." });
  if (!user_id) errors.push({ field: "user_id", message: "ID del usuario requerido." });

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({
        errors: [{ field: "user_id", message: "Usuario no encontrado." }]
      });
    }

    const items: any[] = [];

    for (const productId in products) {
      const quantity = Number(products[productId]);
      const dbProduct = await Product.findOne({ where: { id_product: Number(productId) } });

      if (!dbProduct) {
        return res.status(400).json({
          errors: [{ field: "products", message: `Producto con ID ${productId} no encontrado.` }]
        });
      }

      const unitPrice =
        dbProduct.special_price ??
        dbProduct.discount_price ??
        dbProduct.price;

      items.push({
        id: dbProduct.id_product.toString(),
        title: dbProduct.title,
        category_id: dbProduct.subcategory_slug,
        quantity,
        unit_price: unitPrice,
      });
    }

    // Crear el pago en Mercado Pago
    const mpResponse = await payment.create({
      body: {
        transaction_amount: Number(precio_total),
        token,
        description: "Pago desde carrito",
        payment_method_id: tipo,
        installments: 1,
        payer: {
          email: user.email,
          first_name: user.name,
          last_name: user.lastname,
          phone: {
            area_code: "57",
            number: user.phone
          },
          identification: {
            type: user.id_type,
            number: user.id_number
          }
        },
        additional_info: {
          items
        }
      }
    });

    const paymentId = mpResponse.id;
    
    if (!paymentId) {
      return res.status(500).json({
        errors: [{
          field: "mercado_pago",
          message: "No se pudo obtener el ID del pago desde la respuesta de Mercado Pago."
        }]
      });
    }

    // Consultar el estado del pago inmediatamente después
    const paymentStatus = await payment.get({ id: paymentId });

    // Enviar correo según estado del pago
    if (paymentStatus.status === "approved") {
      await sendPaymentSuccessEmail(user.email, items, paymentStatus.transaction_amount?? precio_total);
      //
      const newOrder = new Order();
      newOrder.total_price = Number(precio_total);
      newOrder.payment_status = paymentStatus.status;
      newOrder.payment_id = paymentId.toString()
      newOrder.user = user;
      console.log(newOrder)
      await newOrder.save();

      for (const productId in products) {
        const quantity = Number(products[productId]);
        const dbProduct = await Product.findOne({ where: { id_product: Number(productId) } });

        if (dbProduct) {
          const orderProduct = new OrderProduct();
          orderProduct.order = newOrder;
          orderProduct.product = dbProduct;
          orderProduct.quantity = quantity;

          const unitPrice =
            dbProduct.special_price ??
            dbProduct.discount_price ??
            dbProduct.price;

          orderProduct.unit_price = unitPrice;

          await orderProduct.save();
        }
      }

      //
    } else {
      const estado = paymentStatus.status_detail || "desconocido";
      await sendPaymentFailureEmail(user.email, estado);
    }

    return res.status(200).json({
      message: "Pago procesado",
      payment: {
        id: paymentId,
        status: paymentStatus.status,
        status_detail: paymentStatus.status_detail,
        ...paymentStatus
      }
    });

  } catch (error: any) {
    console.error("Error al procesar el pago:", error);
    return res.status(500).json({
      errors: [{
        field: "server",
        message: "Error interno procesando el pago.",
        detail: error.message
      }]
    });
  }
};