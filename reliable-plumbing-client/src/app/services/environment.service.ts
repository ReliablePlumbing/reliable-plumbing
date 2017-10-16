import { Injectable } from '@angular/core';
import { UserInfo } from '../models/user-info';

@Injectable()
export class EnvironmentService {
    private tokenVariableName = 'authToken';
    private currentUserVariableName = 'currentUser';
    private persistentLoginVariableName = 'persistentLogin';
    private _currentUser: UserInfo;
    private _persistentLogin: any;

    constructor() {
    }

    public get token(): string {
        let tokenObj = JSON.parse(localStorage.getItem(this.tokenVariableName))
            
        return tokenObj == null ? null : tokenObj.token;
    }

    public get serializedToken() {
        return JSON.parse(localStorage.getItem(this.tokenVariableName));
    }

    public get currentUser(): UserInfo {
        if (this._currentUser == null) {
            this._currentUser = JSON.parse(localStorage.getItem(this.currentUserVariableName));
            // this._currentUser.userTypeEnum = this._currentUser.userType.id;
        }
        return this._currentUser;
    }

    public get persistentLogin(): any {
        if (this._persistentLogin == null) {
            this._persistentLogin = JSON.parse(localStorage.getItem(this.persistentLoginVariableName));
        }
        return this._persistentLogin;
    }

    public set currentUser(user) {
        this._currentUser = user;
    }

    public get isUserLoggedIn(): boolean {
        return this.token != null && this.token.length > 0;
    }

    public setUserLoginInfo(responseData: any) {
        this._currentUser = null;
        this._persistentLogin = null;
        
        localStorage.setItem(this.tokenVariableName, JSON.stringify(responseData.token));
        localStorage.setItem(this.currentUserVariableName, JSON.stringify(responseData.user));
        if (responseData.rememberMe != null)
            localStorage.setItem(this.persistentLoginVariableName, JSON.stringify(responseData.rememberMe));
    }

    public destroyLoginInfo() {
        this._currentUser = null;
        this._persistentLogin = null;
        
        localStorage.removeItem(this.tokenVariableName);
        localStorage.removeItem(this.currentUserVariableName);
        localStorage.removeItem(this.persistentLoginVariableName);
    }

}