import dotenv from 'dotenv';
import { User } from "./models/user";
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
        numberOfBreakFastOrganised: user.numberOfBreakFastOrganised || 0,
        nextOrganizedBreakfastDate: user.nextOrganizedBreakfastDate || null,
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