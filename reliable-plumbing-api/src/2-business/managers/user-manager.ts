import { User, Role, AppError, ErrorType } from '../../3-domain/domain-module';
import { UserRepo } from '../../4-data-access/data-access.module';
import { AccountSecurity, dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

export class UserManager {

    @Inject(dependcies.UserRepo)
    private userRepo: UserRepo;

    registerUser(user: User): Promise<User> {
        if (user == null)
            throw new Error('user cann\'t be null');

        let errors = this.validateUser(user);
        if (errors.length > 0) {
            throw new AppError(errors, ErrorType.validation);
        }

        user.salt = AccountSecurity.generateSalt();
        user.hashedPassword = AccountSecurity.hashPassword(user.password, user.salt);

        if (user.roles == null)
            user.roles = [Role.Customer];

        return new Promise<User>((resolve, error) => {
            this.userRepo.findByUserName(user).then(firstResult => {
                if (firstResult != null)
                    error(new AppError('user already exists', ErrorType.validation));

                this.userRepo.add(user).then(result => {
                    resolve(result);
                });
            });
        });
    }


    authenticateUser(user: User): Promise<boolean> {
        let loginError = new Error('username or password is incorrect');
        return new Promise<boolean>((resolve, reject) => {
            if (user == null || user.username == null || user.password == null)
                reject(loginError);
            else {
                this.userRepo.findByUserName(user).then(result => {
                    if (result == null)
                        reject(loginError);

                    let passwordHash = AccountSecurity.hashPassword(user.password, result.salt);

                    if (result.hashedPassword != passwordHash)
                        reject(loginError);

                    resolve(true);
                });
            }
        })
    }

    private validateUser(user: User): string[] {
        let errors: string[] = []
        if (user.username == null || user.username.length == 0)
            errors.push('username cann\'t be empty');
        if (user.username != null && user.username.length > 30)
            errors.push('username must be less than 30 characters');
        if (user.password == null || user.password.length == 0)
            errors.push('password cann\'t be empty');
        errors = errors.concat(this.validatePasswordFormat(user.password));
        if (user.firstName == null || user.firstName.length == 0)
            errors.push('first name cann\'t be empty');
        if (user.email == null || user.email.length == 0)
            errors.push('email cann\'t be empty');
        // let emailRegex = new RegExp('');
        // if (!emailRegex.test(user.email))
        //     errors.push('email is invalid');
        if (user.mobile == null || user.mobile.length == 0)
            errors.push('mobile cann\'t be empty');
        // let mobileRegex = new RegExp('');
        // if (!mobileRegex.test(user.mobile))
        //     errors.push('mobile is invalid');

        return errors;
    }

    private validatePasswordFormat(password: string): string[] {
        let errors: string[] = []
        let passwordRegex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$');
        if (!passwordRegex.test(password)) {
            errors.push('password length must not be less than 8 characters');
            errors.push('password must have at least one upper case English letter');
            errors.push('password must have at least one lower case English letter');
            errors.push('password must have at least one digit');
            errors.push('password must have at least one special character');
        }

        return errors;
    }
}