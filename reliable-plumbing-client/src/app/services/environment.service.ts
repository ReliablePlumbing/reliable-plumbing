import { Injectable } from '@angular/core';
import { UserInfo } from '../models/user-info';

@Injectable()
export class EnvironmentService {
    private tokenVariableName = 'token';
    private currentUserVariableName = 'currentUser';
    private _currentUser: UserInfo;

    constructor() {
    }

    public get token(): string {
        return localStorage.getItem(this.tokenVariableName);
    }

    public get currentUser(): UserInfo {
        if (this._currentUser == null) {
            this._currentUser = JSON.parse(localStorage.getItem(this.currentUserVariableName));
            // this._currentUser.userTypeEnum = this._currentUser.userType.id;
        }

        return this._currentUser;
    }

    public set currentUser(user) {
        this._currentUser = user;
    }

    public get isUserLoggedIn(): boolean {
        return this.token != null && this.token.length > 0;
    }

    public setUserLoginInfo(responseData: any) {
        localStorage.setItem(this.tokenVariableName, responseData.token);
        localStorage.setItem(this.currentUserVariableName, responseData.currentUser);
    }

    public destroyLoginInfo() {
        this._currentUser = null;
        localStorage.removeItem(this.tokenVariableName);
        localStorage.removeItem(this.currentUserVariableName);
    }

}