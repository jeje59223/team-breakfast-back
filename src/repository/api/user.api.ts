import dotenv from 'dotenv';
import {UpdateUser, User} from "./models/user";
import { fetchJson } from "../../utils/fetchjJson";
import bcrypt from 'bcrypt';

dotenv.config();

const {
    BASE_MONGODB_URL,
    MONGO_DATASOURCE,
    MONGO_DATABASE,
    MONGO_COLLECTION_USERS,
} = process.env;

export async function getUserByLogin(username: string): Promise<User | null> {
    const url = `${BASE_MONGODB_URL}/find`;
    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { 'login.username': username },
        };

        const data = await fetchJson(url, 'POST', body);
        return data.documents?.[0] || null;
    } catch (err) {
        console.error('Error retrieving user: ', err);
        return null;
    }
}

export async function getUserByLdap(ldap: string): Promise<User | null> {
    const url = `${BASE_MONGODB_URL}/findOne`;

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { ldap },
        };

        const data = await fetchJson(url, 'POST', body);

        return data.document || null;
    } catch (err) {
        console.error('Error retrieving user by ldap:', err);
        return null;
    }
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const url = `${BASE_MONGODB_URL}/findOne`;

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { "login.username": username },
        };

        const data = await fetchJson(url, 'POST', body);

        return data.document || null;
    } catch (err) {
        console.error('Error retrieving user by ldap:', err);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
    const url = `${BASE_MONGODB_URL}/find`;

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: {},
        };

        const data = await fetchJson(url, 'POST', body);
        return data;
    } catch (err) {
        console.error('Error retrieving users:', err);
        return [];
    }
}

export async function addUser(user: User): Promise<any> {
    const url = `${BASE_MONGODB_URL}/insertOne`;

    if (!user.lastname || !user.firstname || !user.email || !user.login || !user.roles || !user.ldap) {
        throw new Error('The lastname, firstname, email, login, roles, and ldap fields are mandatory');
    }

    if (!user.login.password || user.login.password.trim().length === 0) {
        throw new Error('Password is required and must be a valid string');
    }

    const hashedPassword = await bcrypt.hash(user.login.password, 10);

    const newUser = {
        lastname: user.lastname,
        firstname: user.firstname,
        email: user.email,
        login: {
            username: user.login.username,
            password: hashedPassword,
        },
        picture: user.picture || null,
        roles: user.roles,
        datesOfOrganizedBreakfasts: [],
        nextOrganizedBreakfastDate: null,
        creationDate: new Date().toISOString(),
        ldap: user.ldap,
    };

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            document: newUser,
        };

        const data = await fetchJson(url, 'POST', body);
        return data;
    } catch (err) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', err);
        throw new Error('Erreur lors de l\'ajout de l\'utilisateur');
    }
}

export async function deleteUser(ldap: string): Promise<any> {
    const url = `${BASE_MONGODB_URL}/deleteOne`;

    if (!ldap) {
        throw new Error("The 'ldap' field is required to delete a user.");
    }

    const filter = {
        ldap,
    };

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter,
        };

        const data = await fetchJson(url, 'POST', body);
        return data;
    } catch (err) {
        console.error('Error deleting user:', err);
        return null;
    }
}

export async function updateUser(ldap: string, updateData: UpdateUser): Promise<any> {
    const url = `${BASE_MONGODB_URL}/updateOne`;

    if (!ldap || Object.keys(updateData).length === 0) {
        throw new Error("Le champ 'ldap' et au moins un champ de mise à jour sont requis.");
    }

    if (updateData.login && updateData.login.password) {
        const saltRounds = 10;
        updateData.login.password = await bcrypt.hash(updateData.login.password, saltRounds);
    }

    const filter = { ldap };
    const update = { $set: updateData };

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter,
            update,
        };

        return await fetchJson(url, 'POST', body);
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
}

 export type ValidateBreakfastResult =
    | { status: 'already-exists'; message: string }
    | { status: 'success'; message: string };

export async function validateBreakfast(ldap: string, date: string): Promise<ValidateBreakfastResult> {
    const url = `${BASE_MONGODB_URL}/updateOne`;

    if (!ldap || !date) {
        throw new Error("Les champs 'ldap' et 'date' sont requis.");
    }

    try {
        const userResponse = await fetchJson(`${BASE_MONGODB_URL}/findOne`, 'POST', {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { ldap }
        });

        const user = userResponse.document;

        if (user?.datesOfOrganizedBreakfasts?.includes(date)) {
            return {
                status: 'already-exists',
                message: 'Le petit-déjeuner a déjà été validé pour cette date.'
            };
        }

        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { ldap },
            update: {
                $addToSet: { datesOfOrganizedBreakfasts: date },
                $set: { nextOrganizedBreakfastDate: null },
            },
        };

        await fetchJson(url, 'POST', body);

        return {
            status: 'success',
            message: 'Petit-déjeuner validé avec succès.'
        };
    } catch (err) {
        console.error("Erreur lors de la validation du petit-déjeuner :", err);
        throw new Error("Erreur lors de la validation du petit-déjeuner");
    }
}

export async function addNextOrganizedBreakfastDate(
    ldap: string,
    date: string | null
): Promise<any> {
    const url = `${BASE_MONGODB_URL}/updateOne`;

    if (!ldap) {
        throw new Error("Le champ 'ldap' est requis.");
    }

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { ldap },
            update: {
                $set: { nextOrganizedBreakfastDate: date },
            },
        };

        return await fetchJson(url, 'POST', body);
    } catch (err) {
        console.error("Erreur lors de l'ajout d'une date next breakfast' :", err);
        throw new Error("Erreur lors de la mise à jour de la date de next breakfast");
    }
}

export async function removeNextOrganizedBreakfastDate(
    ldap: string
): Promise<any> {
    const url = `${BASE_MONGODB_URL}/updateOne`;

    if (!ldap) {
        throw new Error("Le champ 'ldap' est requis.");
    }

    try {
        const body = {
            dataSource: MONGO_DATASOURCE,
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { ldap },
            update: {
                $set: { nextOrganizedBreakfastDate: null },
            },
        };

        return await fetchJson(url, 'POST', body);
    } catch (err) {
        console.error("Erreur lors de la suppression de la date next breakfast :", err);
        throw new Error("Erreur lors de la suppression de la date de next breakfast");
    }
}
