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
        console.error('Error retrieving user:', err);
        return null;
    }
}

export async function getUsersByCurl(): Promise<User[]> {
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

export async function addUserByCurl(user: User): Promise<any> {
    const url = `${BASE_MONGODB_URL}/insertOne`;

    if (!user.lastname
        || !user.firstname
        || !user.email
        || !user.login
        || !user.roles
        || !user.ldap) {
        throw new Error('The lastname, firstname, email, login, roles and ldap fields are mandatory');
    }

    const newUser = {
        lastname: user.lastname,
        firstname: user.firstname,
        email: user.email,
        login: {
            username: user.login.username,
            password: await bcrypt.hash(user.login.password, 10),
        },
        picture: null,
        roles: user.roles,
        numberOfBreakFastOrganised: 0,
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
        return null;
    }
}