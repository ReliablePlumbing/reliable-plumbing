import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, UseInterceptor } from "routing-controllers";
import { Role, User, UserLogin } from '../../3-domain/domain-module';
import { UserManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { AuthorizationProvider } from '../authorization/authorization-provider';
import { LoginCredentials } from "../../3-domain/entities/login-credentials";

@JsonController('/notifications')
export class notificationController {

@Get('/connect')
@Authorized()
connectSocket(){
    
}


}