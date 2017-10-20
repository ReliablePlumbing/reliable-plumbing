import { User, Role, AppError, ErrorType, UserLogin, Notification, NotificationType } from '../../3-domain/domain-module';
import { UserRepo, UserLoginRepo } from '../../4-data-access/data-access.module';
import { MailNotifierManager } from '../mail-notifier/mail-notifier-manager';
import { AccountSecurity, dependencies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Inject, Service } from 'typedi';
import { NotificationManager } from './notification-manager';

@Service()
export class UserManager {

    // region dependencies
    @Inject(dependencies.UserRepo)
    private userRepo: UserRepo;

    @Inject(dependencies.UserLoginRepo)
    private userLoginRepo: UserLoginRepo;

    @Inject(dependencies.mailNotifierManager)
    private mailNotifier: MailNotifierManager;

    @Inject(dependencies.NotificationManager)
    private notificationManager: NotificationManager;
    // endregion dependencies

    registerUser(user: User): Promise<any> {
        if (user == null)
            throw new Error('user cann\'t be null');

        let errors = this.validateUser(user, !this.isSystemUser(user.roles));
        if (errors.length > 0) {
            throw new AppError(errors, ErrorType.validation);
        }

        if (user.password != null) {
            user.salt = AccountSecurity.generateSalt();
            user.hashedPassword = AccountSecurity.hashPassword(user.password, user.salt);
        }
        user.creationDate = new Date();
        if (user.roles == null || user.roles.length == 0) {
            user.roles = [Role.Customer];
            user.isActivated = true;
            user.activationDate = new Date();
        }
        else
            user.isActivated = false;

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

    authenticatePersistentLogin(userLogin: UserLogin): Promise<any> {
        let loginError = new Error('email or password is incorrect');
        return new Promise<any>((resolve, reject) => {
            if (userLogin == null || userLogin.email == null || userLogin.selector == null || userLogin.validator == null)
                reject(loginError);
            else {
                this.userLoginRepo.findLogin(userLogin.selector).then(login => {
                    if (login == null) // saved logins deleted
                        return reject(loginError);
                    let validatorHash = AccountSecurity.hashValidator(userLogin.validator, userLogin.email);
                    if (login.hashedValidator != validatorHash)// A theft is assumed // clear all user saved logins
                        reject(loginError);
                    else { // Update saved login and authenticate user
                        this.userRepo.findByEmail(userLogin.email).then(user => {
                            if (user == null)
                                return reject(loginError);
                            resolve(user);
                        });
                    }
                });
            }
        })
    }

    updatePersistentUserLogin(userLogin: UserLogin) {
        return new Promise<UserLogin>((resolve, reject) => {
            let validator = TokenManager.generateRandomSeries();
            userLogin.validator = validator;
            userLogin.id = userLogin.selector; //must have atm
            userLogin.hashedValidator = AccountSecurity.hashValidator(validator, userLogin.email);
            this.userLoginRepo.findOneAndUpdate(userLogin).then(result => {
                //check if updated successfully
                if (result != null) {
                    result.validator = validator;
                    return resolve(result);
                }
            });
        });
    }

    authenticateUser(user: User): Promise<any> {
        let loginError = new Error('email or password is incorrect');
        return new Promise<any>((resolve, reject) => {
            if (user == null || user.email == null || user.password == null)
                reject(loginError);
            else {
                this.userRepo.findByEmail(user.email).then(result => {
                    if (result == null)
                        return reject(loginError);

                    let passwordHash = AccountSecurity.hashPassword(user.password, result.salt);

                    if (result.hashedPassword != passwordHash)
                        reject(loginError);
                        
                    resolve(result);
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
        return new Promise<any>((resolve, reject) => {
            TokenManager.decodeToken(token).then(decodedToken => {

                if (decodedToken == null)
                    return resolve({ success: false, message: 'Activation Link is Expired', user: null });
                let email = decodedToken.email;

                this.userRepo.findByEmail(email).then(user => {
                    if (user == null)
                        return resolve({ success: false, message: 'User doesn\'t Exist', user: null });
                    if (user.isEmailVerfied && user.isActivated)
                        return resolve({ success: true, message: 'Email is activated', user: user.toLightModel() });

                    user.isEmailVerfied = true;
                    user.emailActivationDate = new Date();
                    this.userRepo.update(user).then(res => {
                        return resolve({ success: true, message: 'Email is activated', user: user.toLightModel() });
                    });
                })
            });
        });
    }

    completeUserRegistration(userWithToken) {
        return new Promise<boolean>((resolve, reject) => {
            let token = userWithToken.token;
            let editedUser = userWithToken.user;

            TokenManager.decodeToken(token).then(decodedToken => {

                if (decodedToken == null)
                    return reject(new AppError('Not Allowed', ErrorType.validation));
                let email = decodedToken.email;

                this.userRepo.findByEmail(email).then(user => {
                    if (user == null)
                        return reject(new AppError('User doesn\'t Exist', ErrorType.validation));
                    if (user.isActivated)
                        return reject(new AppError('User already activated', ErrorType.validation));

                    let errors = this.validateUser(editedUser);
                    if (errors.length > 0)
                        throw new AppError(errors, ErrorType.validation);

                    editedUser.salt = AccountSecurity.generateSalt();
                    editedUser.hashedPassword = AccountSecurity.hashPassword(editedUser.password, editedUser.salt);
                    editedUser.isActivated = true;
                    editedUser.activationDate = new Date();
                    this.userRepo.findOneAndUpdate(editedUser).then(res => {

                        return resolve(res != null);
                    });
                })
            });
        });
    }

    getAllSystemUsers() {
        return new Promise<User[]>((resolve, reject) => {
            let roles = [Role.Admin, Role.Technician];

            this.userRepo.getUserWithRoles(roles).then(result => {
                if (result == null)
                    return resolve([]);

                return resolve(result);
            });
        });
    }

    deleteUserById(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.deleteById(id).then(result => {
                return resolve(result);
            })
        });
    }

    checkUserRoles(email: string, roles: Role[]) {
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.findByEmail(email).then(user => {
                if (!user.isActivated)
                    return resolve(false);
                for (let userRole of user.roles)
                    for (let role of roles)
                        if (userRole == role)
                            return resolve(true);

                resolve(false);
            })
        });
    }
    // region private methods
    private validateUser(user: User, validatePassword = true): string[] {
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
        if (validatePassword) {
            if (user.password == null || user.password.length == 0)
                errors.push('password cann\'t be empty');
            errors = errors.concat(this.validatePasswordFormat(user.password));
        }
        if (user.firstName == null || user.firstName.length == 0)
            errors.push('first name cann\'t be empty');
        if (user.mobile == null || user.mobile.length == 0)
            errors.push('mobile cann\'t be empty');
        // let mobileRegex = new RegExp('');
        // if (!mobileRegex.test(user.mobile))
        //     errors.push('mobile is invalid');

        return errors;
    }

    private isSystemUser(roles: Role[]) {
        if (roles == null || roles.length == 0)
            return false

        for (let role of roles)
            if (role == Role.Admin || role == Role.Technician)
                return true;

        return false;
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
            email: user.email
        })
        let url = ConfigService.config.activationMailUrl + token;
        let isSystemUser = user.roles.findIndex(role => role == Role.Customer) == -1;
        let subject = isSystemUser ? 'Account & Email ' : 'Email ' + 'Activation';

        let contentMessage = isSystemUser ? 'Account & Email Activation' : 'Email Activation';
        // todo: get template
        let content = `<h3>please follow the link bellow to activate your ${subject}<h3>\n
                        <a href="${url}">${subject}<a>`;

        return {
            subject: subject,
            content: content
        }
    }

    createPersistentUserLogin(user: User) {
        let validator = TokenManager.generateRandomSeries();
        let userLogin: UserLogin = new UserLogin({
            email: user.email,
            validator: validator,
            hashedValidator: AccountSecurity.hashValidator(validator, user.email),
            creationDate: new Date()
        });
        return new Promise<UserLogin>((resolve, reject) => {
            this.userLoginRepo.add(userLogin).then(result => {
                return resolve(result);
            });
        });
    }

    // endregion
}