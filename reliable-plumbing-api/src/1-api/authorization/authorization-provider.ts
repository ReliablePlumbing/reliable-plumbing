import * as jwt from 'jsonwebtoken';
import { Role, User } from '../../3-domain/domain-module';
import { ConfigService } from '../../5-cross-cutting/cross-cutting.module';

export class AuthorizationProvider {


    static validateToken(token: string, roles?: Role[]) {
        return new Promise<boolean>(resolve => {
            let key = ConfigService.config.authorization.tokenKey;
            jwt.verify(token, key, (err, decoded) => {
                if (err)
                    return resolve(false);

                return resolve(true);
            });
        });
    }

    static generateToken(user: User): Object {

        let key = ConfigService.config.authorization.tokenKey; // get the key from the configuration
        let expiresIn = ConfigService.config.authorization.tokenExpiration;
        let payload = {
            username: user.username
        }
        return {
            token: jwt.sign(payload, key, {
                expiresIn: expiresIn,
            }),
            expiresIn: expiresIn
        };
    }
}