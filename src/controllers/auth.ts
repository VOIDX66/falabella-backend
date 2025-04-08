import { Request, Response } from "express";
import { User } from "../entities/user";
import { Cart } from "../entities/cart";
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
    emailParams.subject = "Código de restablecimiento de contraseña";
    emailParams.html = `
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Si no fuiste tú, ignora este correo.</p>
      <p>Código para restablecer tu contraseña:</p>
      <h2>${resetCode}</h2>
      <p>Este código expira en 10 minutos.</p>
    `;
    emailParams.text = `Tu código de restablecimiento es: ${resetCode}`;

    await mailerSend.email.send(emailParams);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("No se pudo enviar el correo de restablecimiento");
  }
};

// Forgot password
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

// Verificación del código
export const verifyCodeAndResetPassword = async (req: Request, res: Response): Promise<any> => {
    const { email, code, new_password } = req.body;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\s¡¿"ºª·`´çñÑ,]).{8,}$/;
  
    if (!email || !code || !new_password) {
      return res.status(400).json({ message: "Correo, código y nueva contraseña son requeridos." });
    }
  
    // Validar primero el código
    const storedCode = tempCodeStore[email];
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ message: "Código incorrecto o expirado." });
    }
  
    // Validar formato de la nueva contraseña
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
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
  
      const hashedPassword = await bcrypt.hash(new_password, 10);
      user.password = hashedPassword;
      await user.save();
  
      delete tempCodeStore[email];
  
      return res.status(200).json({ message: "Contraseña restablecida con éxito." });
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      return res.status(500).json({ message: "Error del servidor al actualizar la contraseña." });
    }
  };