import { Request, Response } from "express";
import { User } from "../entities/user";
import { Cart } from "../entities/cart";
import { FavoriteList } from "../entities/favoritelist";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { MailerSend, EmailParams, Recipient, Sender } from 'mailersend';

// Clave secreta para firmar los tokens
const JWT_SECRET = process.env.JWT_SECRET as string;

// Funcion para iniciar sesion
export const login = async (req: Request, res: Response): Promise<any> => {
    // Validar email y password
    await body("email").isEmail().withMessage("Invalid email format").run(req);
    await body("password").notEmpty().withMessage("Password is required").run(req);

    const errors = validationResult(req);
    const validationErrors = errors.array().map(err => ({
        field: (err as any).path || "unknown", // Se usa "path" si está disponible, de lo contrario "unknown"
        message: err.msg
    }));

    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    const { email, password } = req.body;
    try {
        const errors: { field: string; message: string }[] = [];

        // Buscar usuario en la base de datos
        const user = await User.findOneBy({ email });
        if (!user) {
            errors.push({ field: "email", message: "Invalid credentials" });
        }

        if (user) {
            // Comparar contraseña con la almacenada en la BD
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                errors.push({ field: "password", message: "Invalid credentials" });
            }
        }

        if (errors.length > 0) {
            return res.status(401).json({ errors });
        }

        // Generar JWT
        const token = jwt.sign(
            { userId: user!.user_id, email: user!.email },
            JWT_SECRET,
            { expiresIn: "2h" } // Token expira en 2 horas
        );

        return res.json({ token });
    } catch (error) {
        return res.status(500).json({
            errors: [{ field: "server", message: "Server Error" }]
        });
    }
};

// Funcion para crear usuario
export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, lastname, email, id_type, id_number, phone, password } = req.body;
        const errors: { field: string; message: string }[] = [];

        // Validar que todos los campos estén presentes
        if (!name || !lastname || !email || !id_type || !id_number || !phone || !password) {
            errors.push({ field: "general", message: "All fields are required" });
        }

        // Validar email
        if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            errors.push({ field: "email", message: "Invalid email format" });
        }

        // Validar nombre
        if (name && !/^(?=(?:.*[A-Za-zÁÉÍÓÚáéíóúñÑ]){2,})[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(name)) {
            errors.push({ field: "name", message: "Name must be at least 2 characters long and can only contain letters and spaces" });
        }

        // Validar apellido
        if (lastname && !/^(?=(?:.*[A-Za-zÁÉÍÓÚáéíóúñÑ]){2,})[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(lastname)) {
            errors.push({ field: "lastname", message: "Lastname must be at least 2 characters long and can only contain letters and spaces" });
        }

        // Validar id_type
        if (id_type && id_type !== "CC" && id_type !== "CE") {
            errors.push({ field: "id_type", message: "id_type must be either 'CC' or 'CE'" });
        }

        // Validar id_number y phone
        if (phone && !/^\d+$/.test(phone)) {
            errors.push({ field: "phone", message: "Phone must be numeric" });
        }

        if (id_number) {
            if (id_type === "CE" && !/^[A-Za-z0-9]+$/.test(id_number)) {
                errors.push({ field: "id_number", message: "id_number for 'CE' can contain letters and numbers" });
            } else if (id_type === "CC" && !/^\d+$/.test(id_number)) {
                errors.push({ field: "id_number", message: "id_number for 'CC' must be numeric" });
            }

            if (id_type === "CC" && id_number.length > 10) {
                errors.push({ field: "id_number", message: "CC id_number cannot exceed 10 characters" });
            }

            if (id_type === "CE" && id_number.length > 12) {
                errors.push({ field: "id_number", message: "CE id_number cannot exceed 12 characters" });
            }
        }

        // Validar contraseña
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\s¡¿"ºª·`´çñÑ,]).{8,}$/;
        if (password && !passwordRegex.test(password)) {
            errors.push({
                field: "password",
                message: "Password must be at least 8 characters long, contain one number, one uppercase letter, one lowercase letter, no spaces, and no special characters like '\\¡¿\"ºª·`´çñÑ, '",
            });
        }

        // Si hay errores de validación, devolverlos todos juntos
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Verificar si el email ya está registrado
        const existingUserEmail = await User.findOne({ where: { email } });
        if (existingUserEmail) {
            errors.push({ field: "email", message: "Email already exists" });
        }

        // Verificar si el teléfono ya está registrado
        const existingUserPhone = await User.findOne({ where: { phone } });
        if (existingUserPhone) {
            errors.push({ field: "phone", message: "Phone already exists" });
        }

        // Si hay errores de duplicación, devolverlos
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Hashear la contraseña
        const hashed_password = await bcrypt.hash(password, 10);

        // Crear y guardar usuario
        const user = User.create({
            name,
            lastname,
            email,
            id_type,
            id_number,
            phone,
            password: hashed_password,
        });

        await user.save();
        const cart = Cart.create({ user });
        await cart.save();

        const defaultList = FavoriteList.create({
          user,
          name: "Mis favoritos",
          is_default: true,
        });
        await defaultList.save();

        // Generar JWT para el usuario recién registrado
        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.status(201).json({
            message: "User created successfully",
            token, // JWT
            user: {
                id: user.user_id,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                id_type: user.id_type,
                id_number: user.id_number,
                phone: user.phone,
            },
        });
    } catch (error) {
        return res.status(500).json({ errors: [{ field: "server", message: "Server Error" }] });
    }
};


const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY! });

// Función para generar código
const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const tempCodeStore: Record<string, string> = {};

// Enviar correo con código
const sendResetPasswordEmail = async (email: string, resetCode: string) => {
  try {
    const emailParams = new EmailParams();

    emailParams.from = new Sender("MS_hLkhHc@test-y7zpl98ezk045vx6.mlsender.net", "Falabella(dev)"); // Cambia por el remitente verificado
    emailParams.to = [new Recipient(email, "Usuario")];
    emailParams.subject = "Cambia tu contraseña";
    emailParams.html = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #ffffff; padding: 20px 0; text-align: center;">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NY2JVNwPPLFUvJ66xqNzNKdP9VrMt3E0aQRKuoj4TV-kgD41MSlMb6BTnboB5Oj7NxTSEcWVroe3jFWiUfzn7vxvmPRDl2XyEPUJ65wqFv_CuKaOQSnbsabsLYikAg1_oOW6GZodPUHqjbWLdToeEcPwAoKM9wL9AEM=s0-d-e1-ft#https://image.corp.falabella.com/lib/fe8e127477650c7a70/m/1/980ae602-08fb-439b-bad9-2943edfe46aa.png" alt="Falabella" style="max-width: 180px;">
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #333; font-size: 22px;">Te ayudamos a cambiar tu contraseña</h2>
        <p style="color: #555;">Hola,</p>
        <p style="color: #555;">¿Se te olvidó la contraseña? A quién no le ha pasado. En la pantalla de recuperación <strong>ingresa este código verificador:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 40px; color: #2e7d32; font-weight: bold;">${resetCode}</div>
          <p style="color: #777; font-size: 14px;">Contraseña válida para solo 1 uso.</p>
        </div>
        <p style="color: #555;">Si no fuiste tú quien solicitó el cambio, por favor ignora este correo.</p>
        <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff5722;">
          <strong style="color: #d32f2f;">¡Importante!</strong>
          <p style="margin: 5px 0; font-size: 14px; color: #555;">Nunca te llamaremos o escribiremos para solicitar este código, no lo compartas.</p>
        </div>
      </div>
      <div style="background-color: #003764; color: white; padding: 15px; text-align: center;">
        Agradecemos tu confianza
      </div>
    </div>
  `;
    emailParams.text = `Tu código de restablecimiento es: ${resetCode}`;

    await mailerSend.email.send(emailParams);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("No se pudo enviar el correo de restablecimiento");
  }
};

// Forgot password
// Envío del código de recuperación
export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  await body("email").isEmail().withMessage("Formato de email inválido").run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: (err as any).path || "unknown",
        message: err.msg,
      })),
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ errors: [{ field: "email", message: "Usuario no encontrado" }] });
    }

    const resetCode = generateResetCode();
    tempCodeStore[email] = resetCode;

    setTimeout(() => delete tempCodeStore[email], 10 * 60 * 1000);

    await sendResetPasswordEmail(email, resetCode);

    return res.status(200).json({ message: "Código de restablecimiento enviado al correo." });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ errors: [{ field: "server", message: "Error del servidor" }] });
  }
};

// Verificación del código y cambio de contraseña
export const verifyCodeAndResetPassword = async (req: Request, res: Response): Promise<any> => {
  const { email, code, new_password } = req.body;
  const errors: { field: string, message: string }[] = [];

  if (!email) errors.push({ field: "email", message: "El correo es requerido." });
  if (!code) errors.push({ field: "code", message: "El código es requerido." });
  if (!new_password) errors.push({ field: "password", message: "La nueva contraseña es requerida." });

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const storedCode = tempCodeStore[email];
  if (!storedCode || storedCode !== code) {
    return res.status(400).json({
      errors: [{ field: "code", message: "Código incorrecto o expirado." }]
    });
  }

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\s¡¿"ºª·`´çñÑ,]).{8,}$/;
  if (!passwordRegex.test(new_password)) {
    return res.status(400).json({
      errors: [{
        field: "password",
        message: "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número, sin espacios, y evitar caracteres como '\\¡¿\"ºª·`´çñÑ,'."
      }]
    });
  }

  try {
    const user = await User.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ errors: [{ field: "email", message: "Usuario no encontrado" }] });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    await user.save();

    delete tempCodeStore[email];

    return res.status(200).json({ message: "Contraseña restablecida con éxito." });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return res.status(500).json({ errors: [{ field: "server", message: "Error del servidor al actualizar la contraseña." }] });
  }
};

///
// Enviar correo con código para continuar con la compra
const sendPurchaseContinueEmail = async (email: string, resetCode: string) => {
  try {
    const emailParams = new EmailParams();

    emailParams.from = new Sender("MS_hLkhHc@test-y7zpl98ezk045vx6.mlsender.net", "Falabella(dev)"); // Cambia por el remitente verificado
    emailParams.to = [new Recipient(email, "Usuario")];
    emailParams.subject = "Termina tu compra con esta contraseña";
    emailParams.html = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #ffffff; padding: 20px 0; text-align: center;">
        <img src="https://ci3.googleusercontent.com/meips/ADKq_NY2JVNwPPLFUvJ66xqNzNKdP9VrMt3E0aQRKuoj4TV-kgD41MSlMb6BTnboB5Oj7NxTSEcWVroe3jFWiUfzn7vxvmPRDl2XyEPUJ65wqFv_CuKaOQSnbsabsLYikAg1_oOW6GZodPUHqjbWLdToeEcPwAoKM9wL9AEM=s0-d-e1-ft#https://image.corp.falabella.com/lib/fe8e127477650c7a70/m/1/980ae602-08fb-439b-bad9-2943edfe46aa.png" alt="Falabella" style="max-width: 180px;">
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #333; font-size: 22px;">Termina tu compra con esta contraseña</h2>
        <p style="color: #555;">Hola,</p>
        <p style="color: #555;">Estamos para ayudarte. Continúa tu compra con esta contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 40px; color: #2e7d32; font-weight: bold;">${resetCode}</div>
          <p style="color: #777; font-size: 14px;">Contraseña válida para solo 1 uso.</p>
        </div>
        <p style="color: #555;">Si no fuiste tú quien solicitó el cambio, por favor ignora este correo.</p>
        <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff5722;">
          <strong style="color: #d32f2f;">¡Importante!</strong>
          <p style="margin: 5px 0; font-size: 14px; color: #555;">Nunca te llamaremos o escribiremos para solicitar este código, no lo compartas.</p>
        </div>
      </div>
      <div style="background-color: #003764; color: white; padding: 15px; text-align: center;">
        Agradecemos tu confianza
      </div>
    </div>
  `;
    emailParams.text = `Tu código para continuar la compra es: ${resetCode}`;

    await mailerSend.email.send(emailParams);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("No se pudo enviar el correo de restablecimiento");
  }
};

// Endpoint para enviar el código de verificación para continuar con la compra
export const sendVerificationCodeForPurchase = async (req: Request, res: Response): Promise<any> => {
  await body("email").isEmail().withMessage("Formato de email inválido").run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: (err as any).path || "unknown",
        message: err.msg,
      })),
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ errors: [{ field: "email", message: "Usuario no encontrado" }] });
    }

    const resetCode = generateResetCode();
    tempCodeStore[email] = resetCode;

    setTimeout(() => delete tempCodeStore[email], 10 * 60 * 1000); // El código expira en 10 minutos

    await sendPurchaseContinueEmail(email, resetCode); // Enviar el correo

    return res.status(200).json({ message: "Código de verificación enviado al correo." });
  } catch (error) {
    console.error("Error al enviar código de verificación:", error);
    return res.status(500).json({ errors: [{ field: "server", message: "Error del servidor" }] });
  }
};

// Verificar código de verificación y generar token para continuar con la compra
export const verifyPurchaseCodeAndGenerateToken = async (req: Request, res: Response): Promise<any> => {
  const { email, code } = req.body;
  const errors: { field: string; message: string }[] = [];

  if (!email) errors.push({ field: "email", message: "El correo es requerido." });
  if (!code) errors.push({ field: "code", message: "El código es requerido." });

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const storedCode = tempCodeStore[email];
  if (!storedCode || storedCode !== code) {
    return res.status(400).json({
      errors: [{ field: "code", message: "Código incorrecto o expirado." }]
    });
  }

  try {
    // Verificar que el usuario existe
    const user = await User.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ errors: [{ field: "email", message: "Usuario no encontrado" }] });
    }

    // Generar el JWT para el usuario sin requerir contraseña
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: "2h" } // Token expira en 2 horas
    );

    // Eliminar el código de verificación para evitar reusos
    delete tempCodeStore[email];

    return res.status(200).json({
      message: "Código verificado con éxito. Token de sesión generado.",
      token
    });
  } catch (error) {
    console.error("Error al verificar el código y generar el token:", error);
    return res.status(500).json({
      errors: [{ field: "server", message: "Error del servidor al generar el token." }]
    });
  }
};
