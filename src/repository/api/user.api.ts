import dotenv from 'dotenv';
import { User } from "./models/user";
import { fetchJson } from "../../utils/fetchjJson";

dotenv.config();

const {
    BASE_MONGODB_URL,
    MONGO_DATASOURCE,
    MONGO_DATABASE,
    MONGO_COLLECTION_USERS,
} = process.env;

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