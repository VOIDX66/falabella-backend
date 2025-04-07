import { Request, Response } from "express";
import { User } from "../entities/user";
import bcrypt from 'bcrypt';

export const get_user_profile = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = (req as any).user.userId; // Obtenemos el `userId` del token

        const user = await User.findOneBy({ user_id: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({
            user_id: user.user_id,
            name: user.name,
            lastname: user.lastname,
            id_type : user.id_type,
            id_number : user.id_number,
            email: user.email,
            phone: user.phone
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : error });
    }
};

// Editar perfil de usuario (name, lastname, lastname2, phone)
export const editProfile = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { name, lastname, lastname2, phone, password, new_password } = req.body;

    const errors: { field: string, message: string }[] = [];

    const wantsToChangeProfile = name || lastname || lastname2 || phone;
    const wantsToChangePassword = password || new_password;

    // Validar que al menos se quiera cambiar algo
    if (!wantsToChangeProfile && !wantsToChangePassword) {
        return res.status(400).json({
            errors: [{ field: "general", message: "At least one field (name, lastname, lastname2, phone, password) is required" }]
        });
    }

    // Validaciones de perfil
    if (name && !/^(?=(?:.*[A-Za-zÁÉÍÓÚáéíóúñÑ]){2,})[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(name)) {
        errors.push({ field: "name", message: "Name must be at least 2 letters and can only contain letters and spaces" });
    }

    if (lastname && !/^(?=(?:.*[A-Za-zÁÉÍÓÚáéíóúñÑ]){2,})[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(lastname)) {
        errors.push({ field: "lastname", message: "Lastname must be at least 2 letters and can only contain letters and spaces" });
    }

    if (lastname2 && !/^(?=(?:.*[A-Za-zÁÉÍÓÚáéíóúñÑ]){2,})[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(lastname2)) {
        errors.push({ field: "lastname2", message: "Lastname2 must be at least 2 letters and can only contain letters and spaces" });
    }

    if (phone && !/^\d+$/.test(phone)) {
        errors.push({ field: "phone", message: "Phone must be numeric" });
    }

    // Validaciones de contraseña
    if (wantsToChangePassword) {
        if (!password || !new_password) {
            errors.push({ field: "password", message: "Both password and new_password are required to change password" });
        } else {
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\s¡¿"ºª·`´çñÑ,]).{8,}$/;
            if (!passwordRegex.test(new_password)) {
                errors.push({
                    field: "new_password",
                    message: "Password must be at least 8 characters long, contain one number, one uppercase letter, one lowercase letter, no spaces, and no special characters like '\\¡¿\"ºª·`´çñÑ,'"
                });
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const user = await User.findOne({ where: { user_id: Number(id) } });

        if (!user) {
            return res.status(404).json({ errors: [{ field: "user", message: "User not found" }] });
        }

        // Cambio de contraseña si se solicitó
        if (password && new_password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ errors: [{ field: "password", message: "Current password is incorrect" }] });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            user.password = hashedPassword;
        }

        // Actualización de perfil
        if (name) user.name = name;
        if (lastname) user.lastname = lastname;
        if (lastname2) (user as any).lastname2 = lastname2;
        if (phone) user.phone = phone;

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.user_id,
                name: user.name,
                lastname: user.lastname,
                lastname2: (user as any).lastname2 || null,
                phone: user.phone,
            },
        });

    } catch (error) {
        return res.status(500).json({ errors: [{ field: "server", message: "Server error" }] });
    }
};