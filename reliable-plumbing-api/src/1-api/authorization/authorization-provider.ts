// https://paragonie.com/blog/2015/04/secure-authentication-php-with-long-term-persistence#title.2
import * as jwt from 'jsonwebtoken';
import { Inject, Container } from 'typedi';
import { Role, User } from '../../3-domain/domain-module';
import { ConfigService, dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { UserManager } from '../../2-business/business.module';

export class AuthorizationProvider {

    @Inject(dependcies.UserManager)
    private usermanager: UserManager;

    static validateToken(token: string, roles?: Role[]) {
        return new Promise<boolean>(resolve => {
            let key = ConfigService.config.authorization.tokenKey;
            jwt.verify(token, key, (err, decoded: any) => {
                if (err)
                    return resolve(false);
                if (roles != null && roles.length == 0)
                    return resolve(true);

                let usermanager: UserManager = Container.get(dependcies.UserManager);

                usermanager.checkUserRoles(decoded.email, decoded.roles).then(hasRole => resolve(hasRole));
            });
        });
    }

    static generateToken(payload: Object): Object {
        let key = ConfigService.config.authorization.tokenKey; // get the key from the configuration
        let expiresIn = ConfigService.config.authorization.tokenExpiration;
        // let payload = {
        //     email: user.email
        // }
        return {
            token: jwt.sign(payload, key, {
                expiresIn: expiresIn,
            }),
            expiresIn: expiresIn
        };
    }
}