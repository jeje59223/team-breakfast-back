import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export function authorizeRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthenticatedRequest;

        if (!authReq.user || !authReq.user.roles?.includes(requiredRole)) {
            res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
            return;
        }

        next();
    };
}
