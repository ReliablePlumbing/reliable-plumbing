import { User, Role, AppError, ErrorType } from '../../3-domain/domain-module';
import { UserRepo } from '../../4-data-access/data-access.module';
import { MailNotifierManager } from '../mail-notifier/mail-notifier-manager';
import { AccountSecurity, dependcies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

export class UserManager {

    @Inject(dependcies.UserRepo)
    private userRepo: UserRepo;

    @Inject(dependcies.mailNotifierManager)
    private mailNotifier: MailNotifierManager;

    registerUser(user: User): Promise<any> {
        if (user == null)
            throw new Error('user cann\'t be null');

        let errors = this.validateUser(user);
        if (errors.length > 0) {
            throw new AppError(errors, ErrorType.validation);
        }

        user.salt = AccountSecurity.generateSalt();
        user.hashedPassword = AccountSecurity.hashPassword(user.password, user.salt);
        user.creationDate = new Date();
        if (user.roles == null || user.roles.length == 0)
            user.roles = [Role.Customer];

        return new Promise<User>((resolve, error) => {
            this.userRepo.findByEmail(user.email).then(firstResult => {
                if (firstResult != null)
                    return error(new AppError('user already exists', ErrorType.validation));

                this.userRepo.add(user).then(result => {
                    let emailContent = this.constructVerificationMail(user);
                    this.mailNotifier.sendMail(user.email, emailContent.subject, emailContent.content);
                    return resolve(result);
                });
            });
        });
    }


    authenticateUser(user: User): Promise<boolean> {
        let loginError = new Error('username or password is incorrect');
        return new Promise<boolean>((resolve, reject) => {
            if (user == null || user.email == null || user.password == null)
                reject(loginError);
            else {
                this.userRepo.findByEmail(user.email).then(result => {
                    if (result == null)
                        return reject(loginError);

                    let passwordHash = AccountSecurity.hashPassword(user.password, result.salt);

                    if (result.hashedPassword != passwordHash)
                        reject(loginError);

                    resolve(true);
                });
            }
        })
    }

    checkEmailExistence(email: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.findByEmail(email).then(result => {
                resolve(result != null);
            });

        });
    }

    activateMail(token: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            TokenManager.decodeToken(token).then(decodedToken => {
                if (decodedToken == null)
                    return resolve(false);
                // let username = decodedToken.username;
                let email = decodedToken.email;

                this.userRepo.findByEmail(email).then(user => {
                    if (user == null || user.email == null || user.email.toLowerCase() != email.toLowerCase() || user.isEmailVerfied)
                        return resolve(false);

                    user.isEmailVerfied = true;
                    this.userRepo.update(user).then(res => {
                        return resolve(true);
                    })
                })
            });
        });
    }

    getAllSystemUsers() {
        return new Promise<User[]>((resolve, reject) => {
            let roles = [Role.Admin, Role.Technician, Role.Customer];

            this.userRepo.getUserWithRoles(roles).then(result => {
                if(result == null)
                    return resolve([]);

                return resolve(result);
            });
        });
    }

    deleteUserById(id: string){
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.deleteById(id).then(result => {
                return resolve(result);
            })
        });
    }
    // region private methods
    private validateUser(user: User): string[] {
        let errors: string[] = []
        // if (user.username == null || user.username.length == 0)
        //     errors.push('username cann\'t be empty');
        // if (user.username != null && user.username.length > 30)
        //     errors.push('username must be less than 30 characters');
        if (user.email == null || user.email.length == 0)
            errors.push('email cann\'t be empty');
        // let emailRegex = new RegExp('');
        // if (!emailRegex.test(user.email))
        //     errors.push('email is invalid');
        if (user.password == null || user.password.length == 0)
            errors.push('password cann\'t be empty');
        errors = errors.concat(this.validatePasswordFormat(user.password));
        if (user.firstName == null || user.firstName.length == 0)
            errors.push('first name cann\'t be empty');
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

    private constructVerificationMail(user: User) {
        let token = TokenManager.generateToken({
            // username: user.username,
            email: user.email
        })
        let url = ConfigService.config.activationMailUrl + token;
        let subject = 'Email Activation';

        // todo: get template
        let content = `<h3>please follow the link bellow to activate your mail address<h3>\n
                        <a href="${url}">Activate Email<a>`;

        return {
            subject: subject,
            content: content
        }
    }

    // endregion
}