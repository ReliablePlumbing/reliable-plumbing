import { Role } from '../models/enums';

export function isSystemUser(user) {

    return user.roles.findIndex(r => r != Role.Customer) != -1
}

export function isAnyEligible(user, roles) {
    if (!user.roles)
        return false;

    for (let role of user.roles) {
        if (roles.indexOf(role) != -1)
            return true;
    }

    return false;
}
