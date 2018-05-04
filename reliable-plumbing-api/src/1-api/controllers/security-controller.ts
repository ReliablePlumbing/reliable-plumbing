import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, BodyParam, UploadedFiles } from "routing-controllers";
import { SecurityManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

@JsonController('/security')
export class SecurityController {

    @Inject(dependencies.SecurityManager)
    private securityManager: SecurityManager;

    @Get('/getUserRolesPermissions')
    @Authorized()
    getUserRolesPermissions(@QueryParam('email') email: string) {
        return new Promise<any>((resolve, reject) => {
            this.securityManager.getRolePermissionByEmail(email)
                .then(results => {
                    let models = results.map(rolePerm => rolePerm.toLightModel());
                    resolve(models);
                }).catch((error: Error) => reject(error));
        })
    }
}