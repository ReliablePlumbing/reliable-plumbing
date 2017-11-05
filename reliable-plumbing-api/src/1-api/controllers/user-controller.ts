import { JsonController, Controller, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, UseInterceptor, Req, Res } from "routing-controllers";
import { Role, User, UserLogin, SocialMediaProvider } from '../../3-domain/domain-module';
import { UserManager } from '../../2-business/business.module';
import { dependencies, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { AuthorizationProvider } from '../authorization/authorization-provider';
import { LoginCredentials } from "../../3-domain/entities/login-credentials";
import { Request, Response } from "express";
import * as request from 'request';

@JsonController('/users')
export class UserController {

    @Inject(dependencies.UserManager)
    private userManager: UserManager;

    @Post('/register')
    register( @Body() user: User) {
        return new Promise((resolve, reject) => {

            this.userManager.registerUser(user).then((result: User) => {
                return resolve(user.toLightModel());
            }).catch((error: Error) => reject(error));
        });
    }

    @Post("/login")
    login( @Body() loginCredentials: LoginCredentials) {
        return new Promise<any>((resolve, reject) => {

            this.userManager.authenticateUser(loginCredentials.user).then((result: User) => {
                let user = new User(result);
                let tokenPayload = { email: user.email, roles: user.roles };
                if (loginCredentials.rememberMe) {
                    this.userManager.createPersistentUserLogin(loginCredentials.user).then((userLogin: UserLogin) => {
                        resolve({
                            token: AuthorizationProvider.generateToken(tokenPayload),
                            user: user.toLightModel(),
                            rememberMe: userLogin.toLightModel()
                        });
                    });
                }
                else {
                    resolve({
                        token: AuthorizationProvider.generateToken(tokenPayload),
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

    @Post('/completeUserRegistration')
    completeUserRegistration( @Body() userWithToken: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.userManager.completeUserRegistration(userWithToken).then(result => resolve(result))
        })
    }

    @Get("/getAllSystemUsers")
    @Authorized([Role.Manager])
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
    @Authorized([Role.Manager])
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

    @Post('/socialLogin')
    socialLogin( @Body() bodyParams: any) {
        return new Promise<any>((resolve, reject) => {
            let promise: Promise<User> = null;
            switch (bodyParams.provider) {
                case SocialMediaProvider.Facebook:
                    promise = this.authenticateByFacebook(bodyParams.code, bodyParams.redirectUri);
                    break;
                case SocialMediaProvider.Google:
                    promise = this.authenticateByGoogle(bodyParams.code, bodyParams.redirectUri)
                    break;
                default:
                    return resolve(null);
            }

            if (promise == null)
                return resolve(null);

            promise.then(user => {
                this.userManager.saveSocialMediaLogin(user).then(updatedUser => {
                    let user = new User(updatedUser);
                    let tokenPayload = { email: user.email, roles: user.roles };
                    return resolve({
                        token: AuthorizationProvider.generateToken(tokenPayload),
                        user: user.toLightModel(),
                        rememberMe: null
                    });
                }); // save user in db promise
            }); // provider promise
        });// return promise
    }



    private authenticateByFacebook(code, redirectUri) {
        return new Promise<User>((resolve, reject) => {

            let facebookConfig = ConfigService.config.socialMedia.facebook;

            let fields = facebookConfig.profileFields;
            let accessTokenUrl = facebookConfig.accessTokenUrl;
            let graphApiUrl = facebookConfig.graphApiUrl + fields.join(',');

            var params = {
                code: code,
                client_id: facebookConfig.clientId,
                client_secret: facebookConfig.clientSecret,
                redirect_uri: redirectUri
            };

            request.get({ url: accessTokenUrl, qs: params, json: true }, (err, response, accessToken) => {
                if (response.statusCode !== 200)
                    return resolve(null);
                request.get({ url: graphApiUrl, qs: accessToken, json: true }, function (err, response, profile) {
                    if (response.statusCode !== 200)
                        return resolve(null);
                    let user = new User({
                        email: profile.email,
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        socialMediaId: profile.id,
                        SocialMediaProvider: SocialMediaProvider.Facebook
                    });

                    return resolve(user);
                });
            });
        });

    }

    private authenticateByGoogle(code, redirectUri) {
        return new Promise<User>((resolve, reject) => {

            let googleConfig = ConfigService.config.socialMedia.google;

            let fields = googleConfig.profileFields;
            let accessTokenUrl = googleConfig.accessTokenUrl;
            let peopleApiUrl = googleConfig.peopleApiUrl + fields.join(encodeURIComponent(','));

            let tokenBody = 'code=' + code +
                '&client_id=' + googleConfig.clientId +
                '&client_secret=' + googleConfig.clientSecret +
                '&redirect_uri=' + redirectUri +
                '&grant_type=' + googleConfig.grantType;

            request.post(accessTokenUrl, { body: tokenBody, headers: { 'Content-type': 'application/x-www-form-urlencoded' } },
                (err, response, token) => {
                    if (response == null)
                        return;
                    if (response.statusCode !== 200)
                        return;

                    let accessToken = JSON.parse(token).access_token;
                    let headers = { Authorization: 'Bearer ' + accessToken };

                    request.get({ url: peopleApiUrl, headers: headers, json: true }, function (err, response, profile) {
                        if (response.statusCode !== 200)
                            return resolve(null);
                        let user = new User({
                            email: profile.email,
                            firstName: profile.given_name,
                            lastName: profile.family_name,
                            socialMediaId: null,
                            SocialMediaProvider: SocialMediaProvider.Google
                        });

                        return resolve(user);

                    });
                });
        });
    }

}