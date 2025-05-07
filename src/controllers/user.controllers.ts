import { Request, Response } from "express";
import { User } from "../entities/user";
import { Address } from "../entities/address";
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
            phone: user.phone,
            address : user.addresses
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

// Eliminar cuenta de usuario por ID (desde el frontend)
export const deleteAccount = async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;

    try {
        const user = await User.findOneBy({ user_id: Number(userId) });

        if (!user) {
            return res.status(404).json({
                errors: [{ field: "user", message: "User not found" }]
            });
        }

        await user.remove(); // Elimina el usuario completamente de la base de datos

        return res.status(200).json({
            message: "User account deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            errors: [{ field: "server", message: "Server error" }]
        });
    }
};

export const addAddress = async (req: Request, res: Response): Promise<any> => {
    const { address, userId } = req.body;
    const errors: { field: string; message: string }[] = [];

    if (!address || typeof address !== "object") {
        errors.push({ field: "address", message: "Address must be a valid object" });
    } else {
        const {
            department,
            city,
            via,
            primary_number,
            complement_1,
            complement_2,
            neighborhood,
            reference,
        } = address;

        if (!department || department.trim().length < 2)
            errors.push({ field: "department", message: "Department is required and must be at least 2 characters" });

        if (!city || city.trim().length < 2)
            errors.push({ field: "city", message: "City is required and must be at least 2 characters" });

        if (!via || via.trim().length < 2)
            errors.push({ field: "via", message: "Via is required and must be at least 2 characters" });

        if (!primary_number || primary_number.trim().length < 1)
            errors.push({ field: "primary_number", message: "Primary number is required" });

        if (!neighborhood || neighborhood.trim().length < 2)
            errors.push({ field: "neighborhood", message: "Neighborhood is required and must be at least 2 characters" });

        if (reference && reference.trim().length < 2)
            errors.push({ field: "reference", message: "Reference must be at least 2 characters if provided" });
    }

    if (!userId) {
        errors.push({ field: "userId", message: "A valid userId is required" });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const user = await User.findOne({
            where: { user_id: Number(userId) },
            relations: ["addresses"]
        });

        if (!user) {
            return res.status(404).json({
                errors: [{ field: "user", message: "User not found" }]
            });
        }

        const normalized = {
            department: address.department.trim().toLowerCase(),
            city: address.city.trim().toLowerCase(),
            via: address.via.trim().toLowerCase(),
            primary_number: address.primary_number.trim().toLowerCase(),
            complement_1: address.complement_1?.trim().toLowerCase() || "",
            complement_2: address.complement_2?.trim().toLowerCase() || "",
            neighborhood: address.neighborhood.trim().toLowerCase(),
            reference: address.reference?.trim().toLowerCase() || null,
        };

        const exists = user.addresses.some(existing => (
            existing.department.toLowerCase() === normalized.department &&
            existing.city.toLowerCase() === normalized.city &&
            existing.via.toLowerCase() === normalized.via &&
            existing.primary_number.toLowerCase() === normalized.primary_number &&
            (existing.complement_1?.toLowerCase() || "") === normalized.complement_1 &&
            (existing.complement_2?.toLowerCase() || "") === normalized.complement_2 &&
            existing.neighborhood.toLowerCase() === normalized.neighborhood &&
            (existing.reference?.toLowerCase() || "") === (normalized.reference || "")
        ));

        if (exists) {
            return res.status(409).json({
                errors: [{
                    field: "address",
                    message: "This address already exists for the user"
                }]
            });
        }

        const newAddress = Address.create({
            department: address.department.trim(),
            city: address.city.trim(),
            via: address.via.trim(),
            primary_number: address.primary_number.trim(),
            complement_1: address.complement_1?.trim() || "",
            complement_2: address.complement_2?.trim() || "",
            neighborhood: address.neighborhood.trim(),
            reference: address.reference?.trim() || null,
            user,
        });

        await newAddress.save();

        return res.status(201).json({
            message: "Address created successfully",
        });

    } catch (error) {
        return res.status(500).json({
            errors: [{
                field: "server",
                message: "Server error",
                detail: error instanceof Error ? error.message : String(error)
            }]
        });
    }
};


// Direcciones Favoritas
export const toggleFavoriteAddress = async (req: Request, res: Response): Promise<any> => {
    const { userId, addressId } = req.body; 

    const errors: { field: string; message: string }[] = [];

    // Verificar que se pasen los parámetros requeridos
    if (!userId || !addressId) {
        errors.push({
            field: "params",
            message: "Both userId and addressId are required"
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { user_id: Number(userId) } });
        if (!user) {
            return res.status(404).json({
                errors: [{ field: "user", message: "User not found" }]
            });
        }

        // Verificar si la dirección existe y está asociada al usuario
        const address = await Address.findOne({
            where: {
                address_id: Number(addressId),
                user: { user_id: Number(userId) }
            },
            relations: ["user"]
        });
        
        if (!address) {
            return res.status(404).json({
                errors: [{ field: "address", message: "Address not found for this user" }]
            });
        }

        // Alternar el valor de is_favorite
        address.is_favorite = !address.is_favorite;
        await address.save();

        return res.status(200).json({
            message: `Address ${address.is_favorite ? 'marked as' : 'unmarked as'} favorite successfully`,
            address: {
                address_id: address.address_id,
                is_favorite: address.is_favorite
            }
        });

    } catch (error) {
        return res.status(500).json({
            errors: [{
                field: "server",
                message: "Server error",
                detail: error instanceof Error ? error.message : String(error)
            }]
        });
    }
};

// Borrar direccion
export const deleteAddress = async (req: Request, res: Response): Promise<any> => {
    const { userId, addressId } = req.body;

    if (!userId || !addressId) {
        return res.status(400).json({
            errors: [{
                field: "params",
                message: "Both userId and addressId are required"
            }]
        });
    }

    try {
        const address = await Address.findOne({
            where: {
                address_id: Number(addressId),
                user: { user_id: Number(userId) }
            }
        });

        if (!address) {
            return res.status(404).json({
                errors: [{
                    field: "address",
                    message: "Address not found for this user"
                }]
            });
        }

        await address.remove();

        return res.status(200).json({
            message: "Address deleted successfully",
            address_id: address.address_id
        });

    } catch (error) {
        return res.status(500).json({
            errors: [{
                field: "server",
                message: "Server error",
                detail: error instanceof Error ? error.message : String(error)
            }]
        });
    }
};

// Obtener direcciones de un usuario
export const getUserAddresses = async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            errors: [{
                field: "userId",
                message: "UserId is required"
            }]
        });
    }

    try {
        const user = await User.findOne({
            where: { user_id: Number(userId) },
            relations: ["addresses"]
        });

        if (!user) {
            return res.status(404).json({
                errors: [{
                    field: "user",
                    message: "User not found"
                }]
            });
        }

        return res.status(200).json({
            message: "User addresses retrieved successfully",
            addresses: user.addresses
        });

    } catch (error) {
        return res.status(500).json({
            errors: [{
                field: "server",
                message: "Server error",
                detail: error instanceof Error ? error.message : String(error)
            }]
        });
    }
};
