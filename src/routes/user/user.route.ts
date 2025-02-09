import express from 'express';
import { Request, Response } from 'express';
import * as UserService from '../../services/user/user.service';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste des utilisateurs
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 */
router.get('', async (req: Request, res: Response) => {
    res.send(await UserService.getUsersByCurl());
});

export default router;