import * as jwt from 'jsonwebtoken';
import { Inject, Container } from 'typedi';
import { Role, User } from '../../3-domain/domain-module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { UserManager } from '../../2-business/business.module';
import config from '../../config';

export class AuthorizationProvider {

    static validateToken(token: string, roles?: Role[]) {
        return new Promise<boolean>(resolve => {
            let key = config.authorization.tokenKey;
            jwt.verify(token, key, (err, decoded: any) => {
                if (err)
                    return resolve(false);
                if (roles != null && roles.length == 0)
                    return resolve(true);

                let usermanager: UserManager = Container.get(dependencies.UserManager);

                usermanager.checkUserRoles(decoded.email, roles).then(hasRole => resolve(hasRole));
            });
        });
    }

    static generateToken(payload: Object): Object {
        let key = config.authorization.tokenKey; // get the key from the configuration
        let expiresIn = config.authorization.tokenExpiration;
       
        return {
            token: jwt.sign(payload, key, {
                expiresIn: expiresIn,
            }),
            expiresIn: expiresIn
        };
    }
}