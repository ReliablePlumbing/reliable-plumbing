import { User, Role, AppError, ErrorType, UserLogin, Notification, NotificationType } from '../../3-domain/domain-module';
import { UserRepo, UserLoginRepo } from '../../4-data-access/data-access.module';
import { MailNotifier } from '../notifiers/mail-notifier';
import { AccountSecurity, dependencies, TokenManager } from '../../5-cross-cutting/cross-cutting.module';
import { Inject, Service } from 'typedi';
import { NotificationManager } from './notification-manager';
import config from '../../config';
import { SecurityManager } from './security-manager';

@Service()
export class UserManager {

    @Inject(dependencies.UserRepo) private userRepo: UserRepo;
    @Inject(dependencies.UserLoginRepo) private userLoginRepo: UserLoginRepo;
    @Inject(dependencies.mailNotifier) private mailNotifier: MailNotifier;
    @Inject(dependencies.NotificationManager) private notificationManager: NotificationManager;
    @Inject(dependencies.SecurityManager) private securityManager: SecurityManager;

    registerUser(user: User): Promise<any> {
        if (user == null)
            throw new Error('user cann\'t be null');
        user.email = user.email.toLowerCase();
        let errors = this.validateUser(user, user.password != null);
        if (errors.length > 0) {
            throw new AppError(errors, ErrorType.validation);
        }

        if (user.password != null) {
            user.salt = AccountSecurity.generateSalt();
            user.hashedPassword = AccountSecurity.hashPassword(user.password, user.salt);
            user.isActivated = true;
            user.activationDate = new Date();
        }
        else
            user.isActivated = false;
        user.creationDate = new Date();
        if (user.roles == null || user.roles.length == 0)
            user.roles = [Role.Customer];


        return new Promise<User>((resolve, reject) => {
            this.userRepo.findByEmail(user.email).then(firstResult => {
                if (firstResult != null)
                    return reject(new AppError('user already exists', ErrorType.validation));

                this.userRepo.add(user).then(result => {
                    let mail = this.constructVerificationMail(user);
                    this.mailNotifier.sendMail(mail);
                    return resolve(result);
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    updateProfile(user: User) {
        if (user == null)
            throw new Error('user cann\'t be null');
        user.email = user.email.toLowerCase();
        let errors = this.validateUser(user, false);
        if (errors.length > 0) {
            throw new AppError(errors, ErrorType.validation);
        }
        return new Promise<User>((resolve, reject) => {
            this.userRepo.findByEmail(user.email).then(firstResult => {
                if (firstResult == null)
                    return reject(new AppError('user doesn\'t exist', ErrorType.validation));
                let updatedProps = Object.getOwnPropertyNames(user);
                updatedProps.forEach(prop => firstResult[prop] = user[prop]);
                this.userRepo.update(firstResult).then(result => {
                    if (result)
                        return resolve(firstResult);
                    else return resolve(null);
                }).catch((error: Error) => reject(error));;
            }).catch((error: Error) => reject(error));
        });
    }

    authenticatePersistentLogin(userLogin: UserLogin): Promise<any> {
        let loginError = new Error('email or password is incorrect');
        return new Promise<any>((resolve, reject) => {
            if (userLogin == null || userLogin.email == null || userLogin.selector == null || userLogin.validator == null)
                return reject(loginError);
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
                        }).catch((error: Error) => reject(error));
                    }
                }).catch((error: Error) => reject(error));
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
            }).catch((error: Error) => reject(error));
        });
    }

    async authenticateUser(email, password): Promise<any> {
        let loginError = new Error('email or password is incorrect');
        if (email == null || password == null)
            return Promise.reject(loginError);
        else {
            email = email.toLowerCase();
            let user = await this.userRepo.findByEmail(email);
            if (user == null)
                return Promise.reject(loginError);

            let passwordHash = AccountSecurity.hashPassword(password, user.salt);

            if (user.hashedPassword != passwordHash)
                return Promise.reject(loginError);

            user.permissions = await this.securityManager.getPermissionsByRoles(user.roles);

            return user;
        }
    }

    checkEmailExistence(email: string) {
        email = email.toLowerCase();
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.findByEmail(email)
                .then(result => resolve(result != null))
                .catch((error: Error) => reject(error));
        });
    }

    activateMail(token: string): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            TokenManager.decodeToken(token).then(decodedToken => {

                if (decodedToken == null)
                    return resolve({ success: false, message: 'Activation Link is Expired', user: null });
                let email = decodedToken.email.toLowerCase();

                this.userRepo.findByEmail(email).then(user => {
                    if (user == null)
                        return resolve({ success: false, message: 'User doesn\'t Exist', user: null });
                    if (user.isEmailVerfied && user.isActivated)
                        return resolve({ success: true, message: 'Email is activated', user: user.toLightModel() });

                    user.isEmailVerfied = true;
                    user.emailActivationDate = new Date();
                    this.userRepo.update(user).then(res => {
                        return resolve({ success: true, completeProfile: user.password == null, message: 'Email is activated', user: user.toLightModel() });
                    }).catch((error: Error) => reject(error));
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));;
        });
    }

    completeUserRegistration(userWithToken) {
        return new Promise<boolean>((resolve, reject) => {
            let token = userWithToken.token;
            let editedUser = userWithToken.user;

            TokenManager.decodeToken(token).then(decodedToken => {

                if (decodedToken == null)
                    return reject(new AppError('Not Allowed', ErrorType.validation));
                let email = decodedToken.email.toLowerCase();

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
                    }).catch((error: Error) => reject(error));
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    getAllSystemUsers(roles?: Role[]) {
        return new Promise<User[]>((resolve, reject) => {
            if (roles == null || roles.length == 0)
                roles = [Role.Supervisor, Role.Technician];

            this.userRepo.getUsersByRoles(roles).then(result => {
                if (result == null)
                    return resolve([]);

                return resolve(result);
            }).catch((error: Error) => reject(error));
        });
    }

    getUserById(userId: string) {
        return new Promise<User>((resolve, reject) => {

            this.userRepo.findUsersByIds([userId])
                .then(result => {
                    if (result && result.length > 0)
                        return resolve(result[0]);

                    return resolve(null);
                }).catch((error: Error) => reject(error));
        });
    }

    deleteUserById(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.deleteById(id)
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    checkUserRoles(email: string, roles: Role[]) {
        email = email.toLowerCase();
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.findByEmail(email).then(user => {
                if (!user.isActivated)
                    return resolve(false);
                for (let userRole of user.roles)
                    for (let role of roles)
                        if (userRole == role)
                            return resolve(true);

                resolve(false);
            }).catch((error: Error) => reject(error));
        });
    }

    async saveSocialMediaLogin(user: User) {
        return new Promise<User>((resolve, reject) => {
            user.email = user.email.toLowerCase();
            this.userRepo.findByEmail(user.email).then(async result => {
                let promise: Promise<User | boolean> = null;
                if (result == null) {
                    user.activationDate = user.emailActivationDate = user.creationDate = new Date();
                    user.isActivated = user.isEmailVerfied = true;
                    user.roles = [Role.Customer];
                    user.permissions = await this.securityManager.getPermissionsByRoles(user.roles);
                    promise = this.userRepo.add(user);
                }
                else {
                    result.firstName = user.firstName;
                    result.lastName = user.lastName;
                    result.socialMediaId = user.socialMediaId;
                    result.SocialMediaProvider = user.SocialMediaProvider;
                    result.permissions = await this.securityManager.getPermissionsByRoles(result.roles);
                    promise = this.userRepo.update(result);
                }

                promise.then(value => {
                    if (result == null)
                        return resolve(user);
                    else if (value == true)
                        return resolve(result);
                    else
                        return resolve(null);
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    resendActivationLink(email) {
        email = email.toLowerCase();

        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.findByEmail(email).then((result) => {
                if (result == null)
                    throw new AppError('user doesn\'t exist', ErrorType.validation);
                if (result.isActivated)
                    throw new AppError('email already active', ErrorType.validation);

                let mail = this.constructVerificationMail(result);
                this.mailNotifier.sendMail(mail);
                return resolve(true);
            }).catch((error: Error) => reject(error));
        });
    }

    changePassword(args) {
        return new Promise<boolean>((resolve, reject) => {
            this.authenticateUser(args.email, args.oldPassword).then((user: any) => {
                let errors = [];
                if (args.newPassword == null || args.newPassword.length == 0)
                    errors.push('password cann\'t be empty');
                errors = errors.concat(this.validatePasswordFormat(args.newPassword));

                user.salt = AccountSecurity.generateSalt();
                user.hashedPassword = AccountSecurity.hashPassword(args.newPassword, user.salt);
                if (errors.length > 0) {
                    throw new AppError(errors, ErrorType.validation);
                }
                this.userRepo.update(user)
                    .then((result: boolean) => resolve(result))
                    .catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    adminChangePassword(args) {
        return new Promise<boolean>((resolve, reject) => {
            this.userRepo.findByEmail(args.email).then((user: any) => {
                let errors = [];
                if (args.newPassword == null || args.newPassword.length == 0)
                    errors.push('password cann\'t be empty');
                errors = errors.concat(this.validatePasswordFormat(args.newPassword));

                user.salt = AccountSecurity.generateSalt();
                user.hashedPassword = AccountSecurity.hashPassword(args.newPassword, user.salt);
                if (errors.length > 0) {
                    throw new AppError(errors, ErrorType.validation);
                }
                this.userRepo.update(user)
                    .then((result: boolean) => resolve(result))
                    .catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    forgotPassword(email) {
        return new Promise<boolean>((resolve, reject) => {
            if (!email)
                return resolve(false);

            this.userRepo.findByEmail(email).then(user => {
                if (user && user.email.toLowerCase() == email.toLowerCase()) {
                    let mail = this.constructForgotPasswordMail(user);
                    this.mailNotifier.sendMail(mail);
                    return resolve(true);
                }
                else
                    return resolve(false);
            }).catch((error: Error) => reject(error));
        });
    }

    resetPassword(data) {
        if (data == null)
            throw new AppError('Data isn\'t complete', ErrorType.validation);

        return new Promise<any>((resolve, reject) => {
            TokenManager.decodeToken(data.token).then(decodedToken => {

                if (decodedToken == null)
                    return resolve({ success: false, message: 'Reset Password Link is Expired', user: null });
                let email = decodedToken.email.toLowerCase();

                this.userRepo.findByEmail(email).then(user => {
                    if (user == null)
                        return resolve({ success: false, message: 'User doesn\'t Exist', user: null });
                    let errors = [];
                    if (data.newPassword == null || data.newPassword.length == 0)
                        errors.push('password cann\'t be empty');
                    errors = errors.concat(this.validatePasswordFormat(data.newPassword));

                    if (errors.length > 0) {
                        throw new AppError(errors, ErrorType.validation);
                    }
                    user.salt = AccountSecurity.generateSalt();
                    user.hashedPassword = AccountSecurity.hashPassword(data.newPassword, user.salt);
                    this.userRepo.update(user).then(res => {
                        return resolve({ success: true, message: 'Your Password has been updated successfully', user: user.toLightModel() });
                    }).catch((error: Error) => reject(error));
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));;
        });
    }

    searchUsers(searchText: string) {
        return new Promise<User[]>((resolve, reject) => {
            if (searchText == null || searchText.length == 0)
                return resolve([]);

            this.userRepo.getUsersByRoles([Role.Customer]).then(results => {
                searchText = searchText.toLowerCase();
                let filteredUsers = results.filter(user => {

                    return user.firstName.toLowerCase().indexOf(searchText) != -1 ||
                        user.lastName.toLowerCase().indexOf(searchText) != -1 ||
                        (user.firstName + ' ' + user.lastName).toLowerCase().indexOf(searchText) != -1 ||
                        user.email.toLowerCase().indexOf(searchText) != -1 ||
                        user.mobile.toLowerCase().indexOf(searchText) != -1
                });

                return resolve(filteredUsers);
            });

        });
    }

    // region private methods
    private validateUser(user: User, validatePasswords = false): string[] {
        let errors: string[] = []
        if (user.email == null || user.email.length == 0)
            errors.push('email cann\'t be empty');
        let emailRegex = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
        if (!emailRegex.test(user.email))
            errors.push('email is invalid');
        if (validatePasswords) {
            if (user.password == null || user.password.length == 0)
                errors.push('password cann\'t be empty');
            errors = errors.concat(this.validatePasswordFormat(user.password));
            if (user.mobile == null || user.mobile.length == 0)
                errors.push('mobile cann\'t be empty');
            let mobileRegex = new RegExp(/^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/);
            if (!mobileRegex.test(user.mobile))
                errors.push('mobile number is invalid');
        }
        if (user.firstName == null || user.firstName.length == 0)
            errors.push('first name cann\'t be empty');

        return errors;
    }

    private isSystemUser(roles: Role[]) {
        if (roles == null || roles.length == 0)
            return false

        for (let role of roles)
            if (role == Role.Supervisor || role == Role.Technician ||
                role == Role.SystemAdmin || role == Role.Admin)
                return true;

        return false;
    }

    private validatePasswordFormat(password: string): string[] {
        let errors: string[] = []
        let passwordRegex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{6,32}$');
        if (!passwordRegex.test(password)) {
            errors.push('password length must be between 6 and 32 characters');
            errors.push('password must have at least one upper case English letter');
            errors.push('password must have at least one lower case English letter');
            errors.push('password must have at least one digit or one special character');
        }

        return errors;
    }

    private constructVerificationMail(user: User) {
        let token = TokenManager.generateToken({
            email: user.email
        });
        let url = config.activationMailUrl + token;
        return {
            to: user.email,
            subject: 'Reliable Plumbing - Email Verfication',
            template: config.mailSettings.templates.verficationMail,
            context: {
                notifeeName: user.firstName + ' ' + (user.lastName ? user.lastName : ''),
                firstLine: 'Welcome to Reliable Plumbing community',
                secondLine: `please click on the button bellow to verify your Email`,
                link: url,
                btnLbl: 'Verify Email'
            }
        }
    }

    private constructForgotPasswordMail(user: User) {
        let token = TokenManager.generateToken({
            email: user.email
        });
        let url = config.forgotPasswordUrl + token;

        return {
            to: user.email,
            subject: 'Reliable Plumbing - Password Reset',
            template: config.mailSettings.templates.verficationMail,
            context: {
                notifeeName: user.firstName + ' ' + (user.lastName ? user.lastName : ''),
                firstLine: 'we are Sorry you forgot your password, but we are here to help',
                secondLine: `Please follow the link bellow to reset your account's password`,
                link: url,
                btnLbl: 'Reset Password'
            }
        }
    }



    createPersistentUserLogin(user: User) {
        let validator = TokenManager.generateRandomSeries();
        let userLogin: UserLogin = new UserLogin({
            email: user.email.toLowerCase(),
            validator: validator,
            hashedValidator: AccountSecurity.hashValidator(validator, user.email),
            creationDate: new Date()
        });
        return new Promise<UserLogin>((resolve, reject) => {
            this.userLoginRepo.add(userLogin)
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    // endregion
}