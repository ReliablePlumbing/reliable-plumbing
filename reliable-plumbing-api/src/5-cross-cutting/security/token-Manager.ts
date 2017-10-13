import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ConfigService } from '../config/config-service';

export class TokenManager {


    static decodeToken(token: string) {
        return new Promise<any>(resolve => {
            let key = ConfigService.config.authorization.tokenKey;
            jwt.verify(token, key, (err, decoded) => {
                if (err)
                    return resolve(null);

                return resolve(decoded);
            });
        });
    }

    static generateToken(payload: any): string {

        let key = ConfigService.config.authorization.tokenKey; // get the key from the configuration
        let expiresIn = ConfigService.config.authorization.tokenExpiration;
        return jwt.sign(payload, key, {
            expiresIn: expiresIn,
        });
    }

    static generateRandomSeries(): string {
        let length = 255; // get it from configuration
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }
}