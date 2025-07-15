import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface  AuthenticatedRequest extends Request {
    user?: { userId: string; username: string; roles: string[] };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: "Accès non autorisé, token manquant" });
        return
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as AuthenticatedRequest["user"];
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token invalide ou expiré" });
        return
    }
}
