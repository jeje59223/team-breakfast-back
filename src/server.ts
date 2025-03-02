import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { MongoClient } from "mongodb";
import userRouter from "./routes/user/user.route";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerConfig from "./swaggerConfig";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import csrf from "csurf";
import cors from 'cors';
import path from "path";

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const certPath = path.resolve(__dirname, "../certs/isrgrootx1.pem");
console.log("Certificat utilisé :", certPath);

const uri = process.env.MONGO_URL as string;

export const client = new MongoClient(uri, {
    tls: true,
    tlsCAFile: certPath,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(
    csurf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" } })
);

const swaggerDocs = swaggerJsdoc(swaggerConfig);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("Team-Breakfast démarré avec succès!");
});

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 * 1000,
    }
});

app.use(csrfProtection);

app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

if (process.env.NODE_ENV !== "test") {
    client.connect()
        .then(() => {
            app.listen(PORT, () => {
                console.log("✅ Connexion réussie à la base de données");
                console.log(`🚀 Breakfast-back tourne sur le port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("❌ Erreur de connexion à MongoDB :", error);
        });
}

app.use("/users", userRouter);

export default app;
