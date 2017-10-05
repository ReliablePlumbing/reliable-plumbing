import * as crypto from 'crypto';

export class AccountSecurity {

    static generateSalt(): string {
        let length = 100; // get it from configuration
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length);
    }

    static hashPassword(password: string, salt: string): string {
        // return crypto.pbkdf2Sync(password, salt, 1000, 512, 'sha512').toString();
        // let saltBuffer = salt.
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);

        return hash.digest('hex');

    }

}