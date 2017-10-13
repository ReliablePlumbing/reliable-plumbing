import { BaseEntity } from './base/base-entity';
import { User } from "./user";
export class LoginCredentials extends BaseEntity {

    user: User;
    rememberMe: boolean;

    constructor(loginCredentials?: any) {
        super();
        if (loginCredentials != null) {
            this.user = loginCredentials.user;
            this.rememberMe = loginCredentials.rememberMe;
        }
    }

    toLightModel() {
        return {
            user: this.user,
            rememberMe: this.rememberMe
        }
    }
}