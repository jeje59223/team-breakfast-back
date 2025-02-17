import {User} from '../../repository/api/models/user';
import * as UserApi from '../../repository/api/user.api';

export async function getUsersByCurl() {
    return UserApi.getUsersByCurl();
}

export async function addNewUserByCurl(user: User) {
    try {
        return await UserApi.addUserByCurl(user);
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un nouvel utilisateur :', error);
        throw new Error('Erreur lors de la création de l\'utilisateur');
    }
}

export async function getUserByLogin(username: string): Promise<User | null> {
    try {
        return await UserApi.getUserByLogin(username);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
}