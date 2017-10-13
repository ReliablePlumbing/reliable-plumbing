import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, UseInterceptor } from "routing-controllers";
import { Role, User, UserLogin } from '../../3-domain/domain-module';
import { UserManager } from '../../2-business/business.module';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { AuthorizationProvider } from '../authorization/authorization-provider';
import { LoginCredentials } from "../../3-domain/entities/login-credentials";

@JsonController('/users')
export class UserController {

    @Inject(dependcies.UserManager)
    private userManager: UserManager;

    @Post('/register')
    register( @Body() user: User) {
        return new Promise((resolve, reject) => {

            this.userManager.registerUser(user).then((result: User) => {
                resolve({
                    user: result.toLightModel(),
                    authorization: AuthorizationProvider.generateToken(user)
                })
            }).catch((error: Error) => reject(error));
        });
    }

    @Post("/login")
    login( @Body() loginCredentials: LoginCredentials) {
        return new Promise<any>((resolve, reject) => {

            this.userManager.authenticateUser(loginCredentials.user).then((result: User) => {
                let user = new User(result);
                if (loginCredentials.rememberMe) {
                    this.userManager.createPersistentUserLogin(loginCredentials.user).then((userLogin: UserLogin) => {
                        resolve({
                            token: AuthorizationProvider.generateToken(result),
                            user: user.toLightModel(),
                            rememberMe: userLogin.toLightModel()
                        });
                    });
                }
                else {
                    resolve({
                        token: AuthorizationProvider.generateToken(result),
                        user: user.toLightModel(),
                        rememberMe: null
                    });
                }
            }).catch((error: Error) => reject(error));

        });
    }

    @Post("/persistentLogin")
    persistentLogin( @Body() userLogin: UserLogin) {
        return new Promise<any>((resolve, reject) => {

            this.userManager.authenticatePersistentLogin(userLogin).then((user: User) => {
                let _user = new User(user);
                this.userManager.updatePersistentUserLogin(userLogin).then((userLogin: UserLogin) => {
                    let _userLogin = new UserLogin(userLogin);
                    resolve({
                        token: AuthorizationProvider.generateToken(user),
                        user: _user.toLightModel(),
                        rememberMe: _userLogin.toLightModel()
                    });
                });
            }).catch((error: Error) => reject(error));
        });
    }

    @Get('/checkEmailExistence')
    checkEmailExistence( @QueryParam('email') email: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.userManager.checkEmailExistence(email).then(result => resolve(result))
        })
    }


    @Get('/activateMail')
    activateMail( @QueryParam('token') token: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.userManager.activateMail(token).then(result => resolve(result))
        })
    }

    @Get("/getAllSystemUsers")
    getAllSystemUsers() {
        return new Promise((resolve, reject) => {
            this.userManager.getAllSystemUsers().then(result => {
                let lightModels = [];
                for (let user of result)
                    lightModels.push(user.toLightModel());

                return resolve(lightModels);
            })
        })
    }

    @Delete('/deleteUserById')
    deleteUserById( @QueryParam('id') id: string) {
        return new Promise((resolve, reject) => {
            this.userManager.deleteUserById(id).then(result => resolve(result));
        })
    }
    @Get("/validateToken")
    @Authorized()
    validateToken() {
        return 'aaa'
    }



}