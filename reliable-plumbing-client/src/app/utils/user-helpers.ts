import { Role } from '../models/enums';

export function isSystemUser(user){

    return user.roles.findIndex(r => r != Role.Customer) != -1
}