import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, UseInterceptor } from "routing-controllers";
import { Role, User } from '../../3-domain/domain-module';
import { UserManager } from '../../2-business/business.module';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { AuthorizationProvider } from '../authorization/authorization-provider';

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
    login( @Body() user: User) {
        return new Promise<any>((resolve, reject) => {

            this.userManager.authenticateUser(user).then(isValid => {
                resolve(AuthorizationProvider.generateToken(user));
            }).catch((error: Error) => reject(error));

        });
    }

    @Get('/activateMail')
    activateMail(@QueryParam('token') token: string){
        return new Promise<boolean>((resolve, reject) => {
            this.userManager.activateMail(token).then(result => resolve(result))
        })
    }

    @Get("/validateToken")
    @Authorized()
    validateToken() {
        return 'aaa'
    }



}