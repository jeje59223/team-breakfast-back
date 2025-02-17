import express from 'express';
import { Request, Response } from 'express';
import * as UserService from '../../services/user/user.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../../middleware/auth.middleware';

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
    res.send(await UserService.getUsersByCurl());
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
        const result = await UserService.addNewUserByCurl(user);
        res.status(201).json({ message: 'Utilisateur ajouté avec succès', userId: result.insertedId });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags:
 *       - Users
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
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Username et password sont requis' });
        return;
    }

    try {
        const user = await UserService.getUserByLogin(username);

        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.login.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Mot de passe invalide' });
            return;
        }

        const token = jwt.sign(
            { userId: user._id, username: user.login.username },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        const { login, ...userData } = user;
        res.status(200).json({ ...userData, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

export default router;