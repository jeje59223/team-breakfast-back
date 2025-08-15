import express from 'express';
import { Request, Response } from 'express';
import * as UserService from '../../services/user/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth.middleware';
import { updateUserService } from "../../services/user/user.service";
import { getUserByLdap } from "../../repository/api/user.api";
import {authorizeRole, authorizeSelfOrRole} from "../../middleware/role.middleware";
import {User} from "../../repository/api/models/user";

const router = express.Router();

router.get('', authenticateToken, async (req: Request, res: Response) => {
    res.send(await UserService.getUsers());
});

router.post('/add-user', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const user: User = req.body;
        const existingUser = await getUserByLdap(user.ldap);
        if (existingUser) {
            res.status(400).json({ message: 'Un utilisateur avec ce LDAP existe déjà.' });
            return;
        }
        const result = await UserService.addNewUser(user);
        res.status(201).json({ message: 'Utilisateur ajouté avec succès', userId: result.insertedId });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
    }
});

router.get('/username/:username', authenticateToken, async (req: Request, res: Response) => {
    res.send(await UserService.getUserByUsername(req.params.username));
});
// exemple d'utilisation de authorizeSelfOrRole
// authorizeSelfOrRole('ADMIN', 'ldap')
router.delete('/delete-user', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
    try {
        const { ldap } = req.body;

        if (!ldap) {
            res.status(400).json({ message: 'Le champ "ldap" est requis' });
        }

        const result = await UserService.deleteUserByLdap(ldap);

        if (!result) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
    }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: "Username et password sont requis" });
        return;
    }

    try {
        const user = await UserService.getUserByLogin(username);

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.login.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Mot de passe invalide" });
            return;
        }

        const token = jwt.sign(
            { userId: user._id, username: user.login.username, roles: user.roles, ldap: user.ldap },
            process.env.JWT_SECRET as string,
            { expiresIn: "30min" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000,
        });

        res.status(200).json({
            message: "Connexion réussie",
            user: { username: user.login.username, roles: user.roles },
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ message: "Déconnexion réussie" });
});

router.get("/me", authenticateToken, async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
    }

    try {
        const user = await UserService.getUserByLogin(authReq.user.username);

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return;
        }

        const { login, ...userWithoutLogin } = user;

        res.json({ user: userWithoutLogin });

    } catch (error) {
        console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

router.get('/ldap/:ldap', authenticateToken, async (req: Request, res: Response) => {
    res.send(await UserService.getUserWithLdap(req.params.ldap));
});

router.put('/update-user', authenticateToken, authorizeSelfOrRole('ADMIN', 'ldap'), async (req: Request, res: Response) => {
    const { ldap, updateData } = req.body;
    console.log('🛠 Données reçues :', req.body);
    console.log('📌 LDAP :', ldap);
    console.log('📦 updateData :', updateData);
    if (!ldap || !updateData) {
        res.status(400).json({ message: "Le champ 'ldap' et 'updateData' sont requis" });
    }

    if (updateData.ldap) {
        const existingUser = await getUserByLdap(updateData.ldap);
        if (existingUser) {
            res.status(400).json({ message: "Ce LDAP est déjà utilisé par un autre utilisateur." });
        }
    }

    try {
        const updatedUser = await updateUserService(ldap, updateData);
        res.status(200).json({ message: "Utilisateur mis à jour avec succès", updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
});

router.put('/validate-breakfast', authenticateToken, authorizeRole('ADMIN'), async (req: Request, res: Response) => {
    const { ldap, date } = req.body;

    if (!ldap || !date) {
        res.status(400).json({ message: "Les champs 'ldap' et 'date' sont requis." });
    }

    try {
        const result = await UserService.validateBreakfast(ldap, date);
        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Erreur lors de la validation du petit-déjeuner :", error);
        res.status(500).json({ message: "Erreur lors de la validation du petit-déjeuner" });
    }
});

router.put('/add-next-organized-breakfast-date', authenticateToken, authorizeSelfOrRole('ADMIN', 'ldap'), async (req: Request, res: Response) => {
    const { ldap, date } = req.body;

    if (!ldap || !date) {
        res.status(400).json({ message: "Les champs 'ldap' et 'date' sont requis." });
        return;
    }

    try {
        const result = await UserService.addNextOrganizedBreakfastDate(ldap, date);
        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la prochaine date de petit-déjeuner organisé :", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de la prochaine date de petit-déjeuner organisé" });
    }
})

export default router;

router.put('/remove-next-organized-breakfast-date', authenticateToken, authorizeSelfOrRole('ADMIN', 'ldap'), async (req: Request, res: Response) => {
    const { ldap } = req.body;

    if (!ldap) {
        res.status(400).json({ message: "Le champ 'ldap' est requis." });
        return;
    }

    try {
        const result = await UserService.removeNextOrganizedBreakfastDate(ldap);
        res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Erreur lors de la suppression de la prochaine date de petit-déjeuner organisé :", error);
        res.status(500).json({ message: "Erreur lors de la suppression de la prochaine date de petit-déjeuner organisé" });
    }
})