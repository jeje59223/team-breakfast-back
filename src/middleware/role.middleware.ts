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

export function authorizeSelfOrRole(requiredRole?: string, idField: string = 'userId') {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthenticatedRequest;

        if (!authReq.user) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        const userIdentifierFromToken = (authReq.user as any)[idField];
        const userIdentifierFromRequest =
            req.params?.[idField] ||
            req.body?.[idField] ||
            req.query?.[idField];

        // Log pour debug
        console.log(`User identifier from token: ${userIdentifierFromToken}, from request: ${userIdentifierFromRequest}`);

        // Cas 1 : utilisateur agit sur son propre compte
        if (userIdentifierFromToken && userIdentifierFromToken.toString() === userIdentifierFromRequest?.toString()) {
            return next();
        }

        // Cas 2 : utilisateur a le rôle requis
        if (requiredRole && authReq.user.roles?.includes(requiredRole)) {
            return next();
        }

        // Sinon accès refusé
        res.status(403).json({ message: 'Accès refusé' });
    };
}
