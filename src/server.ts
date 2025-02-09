import express from "express";
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from "swagger-ui-express";
import { MongoClient } from "mongodb";
import userRouter from '../src/routes/user/user.route';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerConfig from "./swaggerConfig";

dotenv.config();

const uri = process.env.MONGO_URL as string;
export const client = new MongoClient(uri);
const app = express();
const PORT = process.env.PORT;

const swaggerDocs = swaggerJsdoc(swaggerConfig);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Team-Breakfast démarré avec succès!");
});

if (process.env.NODE_ENV !== 'test') {
    client.connect().then(() => {
        app.listen(PORT, () => {
            console.log("Connexion réussie à la base de données");
            console.log(`Breakfast-back tourne sur le port ${PORT}`);
        });
    });
}

app.use("/users", userRouter);