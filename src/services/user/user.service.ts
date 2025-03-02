import {User} from '../../repository/api/models/user';
import * as UserApi from '../../repository/api/user.api';

export async function getUsers() {
    return UserApi.getUsers();
}

export async function addNewUser(user: User) {
    try {
        return await UserApi.addUser(user);
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un nouvel utilisateur :', error);
        throw new Error('Erreur lors de la création de l\'utilisateur');
    }
}

export async function getUserByLogin(username: string): Promise<User | null> {
    console.log(username)
    try {
        return await UserApi.getUserByLogin(username);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
}

export async function getUserWithLdap(ldap: string): Promise<User | null> {
    return UserApi.getUserByLdap(ldap);
}

export async function getUserByUsername(username: string): Promise<User | null> {
    return UserApi.getUserByUsername(username);
}

export async function deleteUserByLdap(ldap: User['ldap']) {
    try {
        return await UserApi.deleteUser(ldap);
    } catch (error) {
        console.error('Erreur lors de la suppression d\'un utilisateur :', error);
        throw new Error(`Erreur lors de la suppression de l'utilisateur : ${ldap}`);
    }
}