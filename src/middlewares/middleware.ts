import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate_token = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Access Denied: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded; // Guardamos la info del usuario en `req.user`
        return next(); // Continuamos con la siguiente función
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
        return;
    }
};
