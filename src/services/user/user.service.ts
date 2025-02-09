import { User } from '../../repository/api/models/user';
import * as UserApi from '../../repository/api/user.api';

export async function getUsersByCurl() {
    return UserApi.getUsersByCurl();
}