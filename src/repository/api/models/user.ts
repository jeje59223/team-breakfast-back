import { ObjectId } from 'mongodb';

export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

interface Login {
    username: string;
    password: string;
}

export interface User {
    _id: ObjectId;
    lastname: string;
    firstname: string;
    email: string;
    login: Login;
    picture?: string;
    roles: Role[];
    numberOfBreakFastOrganised: number;
    nextOrganizedBreakfastDate?: string;
    creationDate: string;
    ldap: string;
}
