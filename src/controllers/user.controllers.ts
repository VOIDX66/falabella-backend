import { Request, Response } from "express";
import { User } from "../entities/user";

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
            email: user.email,
            phone: user.phone
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : error });
    }
};
