import express from 'express';
import { Request, Response } from 'express';
import * as UserService from '../../services/user/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 */
router.get('', authenticateToken, async (req: Request, res: Response) => {
    res.send(await UserService.getUsers());
});

/**
 * @swagger
 * /users/add-user:
 *   post:
 *     summary: Ajouter un utilisateur
 *     security:
 *        - BearerAuth: []
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: "Sanni"
 *               lastname:
 *                 type: string
 *                 example: "Korpi"
 *               email:
 *                 type: string
 *                 example: "sanni.korpi@example.com"
 *               login:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: "purpleladybug163"
 *                   password:
 *                     type: string
 *                     example: "123"
 *               picture:
 *                 type: string
 *                 example: "https://randomuser.me/api/portraits/women/90.jpg"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [ADMIN, USER]
 *                 example: ["USER"]
 *               numberOfBreakFastOrganised:
 *                 type: integer
 *                 example: 2
 *               nextOrganizedBreakfastDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-26T00:00:00+01:00"
 *               creationDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-02-01"
 *               ldap:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       201:
 *         description: Utilisateur ajouté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur ajouté avec succès"
 *                 userId:
 *                   type: string
 *                   example: "670101ac7c08a7bfefc557cc"
 *       400:
 *         description: Données invalides
 */
router.post('/add-user', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const result = await UserService.addNewUser(user);
        res.status(201).json({ message: 'Utilisateur ajouté avec succès', userId: result.insertedId });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
    }
});


/**
 * @swagger
 * /users/username/{username}:
 *   get:
 *     summary: Récupérer un utilisateur par son nom d'utilisateur
 *     description: Retourne les informations d'un utilisateur à partir de son nom d'utilisateur.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Nom d'utilisateur de l'utilisateur
 *         schema:
 *           type: string
 *         example: jdupont
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65d7a3c9f1b4a2e8b3c1d2e7"
 *                 lastname:
 *                   type: string
 *                   example: "Dupont"
 *                 firstname:
 *                   type: string
 *                   example: "Jean"
 *                 email:
 *                   type: string
 *                   example: "jean.dupont@example.com"
 *                 picture:
 *                   type: string
 *                   example: "https://example.com/profile.jpg"
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["USER"]
 *                 numberOfBreakFastOrganised:
 *                   type: integer
 *                   example: 3
 *                 nextOrganizedBreakfastDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-15T08:00:00.000Z"
 *                 creationDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T12:00:00.000Z"
 *                 ldap:
 *                   type: string
 *                   example: "jdupont"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.get('/username/:username', authenticateToken, async (req: Request, res: Response) => {
    res.send(await UserService.getUserByUsername(req.body.username));
});

/**
 * @swagger
 * /users/delete-user:
 *   delete:
 *     summary: Supprime un utilisateur via son LDAP
 *     description: Supprime un utilisateur de la base de données en utilisant son identifiant LDAP.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ldap:
 *                 type: string
 *                 description: Identifiant LDAP de l'utilisateur à supprimer
 *                 example: "jdupont"
 *     responses:
 *       200:
 *         description: L'utilisateur a été supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'utilisateur a été supprimé avec succès"
 *       400:
 *         description: Champ "ldap" manquant dans la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Le champ 'ldap' est requis"
 *       500:
 *         description: Erreur interne du serveur lors de la suppression de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la suppression de l'utilisateur"
 *                 error:
 *                   type: string
 *                   example: "Détails de l'erreur"
 */
router.delete('/delete-user', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { ldap } = req.body;

        if (!ldap) {
            res.status(400).json({ message: 'Le champ "ldap" est requis' });
        }

        await UserService.deleteUserByLdap(ldap);

        res.status(200).json({ message: 'L\'utilisateur a été supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "purpleladybug163"
 *               password:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "670101ac7c08a7bfefc557cc"
 *                 username:
 *                   type: string
 *                   example: "purpleladybug163"
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [ADMIN, USER]
 *                   example: ["USER"]
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       400:
 *         description: Les informations nécessaires (username et password) sont manquantes
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Mot de passe invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    console.log('BODY : ', req.body)
    if (!username || !password) {
        res.status(400).json({ message: "Username et password sont requis" });
        return;
    }

    try {
        const user = await UserService.getUserByLogin(username);
        console.log('USER : ', user)
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
            { userId: user._id, username: user.login.username, roles: user.roles },
            process.env.JWT_SECRET as string,
            { expiresIn: "30min" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000, // 30 minutes
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

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Déconnecte l'utilisateur
 *     description: Supprime le cookie d'authentification pour déconnecter l'utilisateur.
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnexion réussie
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur interne du serveur
 */
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

/**
 * @swagger
 * /users/ldap/{ldap}:
 *   get:
 *     summary: Récupérer un utilisateur par son identifiant LDAP
 *     description: Retourne les informations d'un utilisateur à partir de son identifiant LDAP.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: ldap
 *         required: true
 *         description: Identifiant LDAP de l'utilisateur
 *         schema:
 *           type: string
 *         example: jdupont
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "65d7a3c9f1b4a2e8b3c1d2e7"
 *                 lastname:
 *                   type: string
 *                   example: "Dupont"
 *                 firstname:
 *                   type: string
 *                   example: "Jean"
 *                 email:
 *                   type: string
 *                   example: "jean.dupont@example.com"
 *                 picture:
 *                   type: string
 *                   example: "https://example.com/profile.jpg"
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["USER"]
 *                 numberOfBreakFastOrganised:
 *                   type: integer
 *                   example: 3
 *                 nextOrganizedBreakfastDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-15T08:00:00.000Z"
 *                 creationDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T12:00:00.000Z"
 *                 ldap:
 *                   type: string
 *                   example: "jdupont"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
router.get('/ldap/:ldap', authenticateToken, async (req: Request, res: Response) => {
    res.send(await UserService.getUserWithLdap(req.params.ldap));
});

export default router;