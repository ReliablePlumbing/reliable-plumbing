import { User } from '../../3-domain/domain-module';
import { UserRepo } from '../../4-data-access/data-access.module';
import { AccountSecurity, dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

export class UserManager {

    @Inject(dependcies.UserRepo)
    private userRepo: UserRepo;

    registerUser(user: User): Promise<User> {
        if (this.userRepo == null)
            throw new Error('');
        if (user == null || user.username == null || user.password == null)
            throw new Error('user or one of its properties cann\'t be null');

        user.salt = AccountSecurity.generateSalt();
        user.hashedPassword = AccountSecurity.hashPassword(user.password, user.salt);

        return new Promise<User>((resolve, error) => {
            this.userRepo.findByUserName(user).then(firstResult => {
                if (firstResult != null)
                    error(new Error('user already exists'));

                this.userRepo.add(user).then(result => {
                    resolve(result);
                });
            });
        });
    }


    validateUser(user: User): Promise<boolean> {
        let loginError = new Error('username or password is incorrect');
        return new Promise<boolean>((resolve, reject) => {
            if (user == null || user.username == null || user.password == null)
                reject(loginError);

            this.userRepo.findByUserName(user).then(result => {
                if (result == null)
                    reject(loginError);

                let passwordHash = AccountSecurity.hashPassword(user.password, result.salt);

                if (result.hashedPassword != passwordHash)
                    reject(loginError);

                resolve(true);
            })
        })

    }

}