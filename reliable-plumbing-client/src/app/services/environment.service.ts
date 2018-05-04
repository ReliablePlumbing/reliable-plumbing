import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { UserInfo } from '../models/user-info';
import { Subject, Observable } from 'rxjs'
import { Permission } from '../models/enums';

@Injectable()
export class EnvironmentService {
    private tokenVariableName = 'authToken';
    private currentUserVariableName = 'currentUser';
    private persistentLoginVariableName = 'persistentLogin';
    private _currentUser: UserInfo;
    private _persistentLogin: any;
    private logoutSource$: Subject<any> = new Subject<any>();
    userLoggedout: Observable<any> = this.logoutSource$.asObservable();

    private localStorageVaiable: any = {}
    constructor( @Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId))
            this.localStorageVaiable = localStorage;
    }

    public get token(): string {
        let tokenObj = JSON.parse(this.localStorageVaiable.getItem(this.tokenVariableName))

        return tokenObj == null ? null : tokenObj.token;
    }

    public get serializedToken() {
        return JSON.parse(this.localStorageVaiable.getItem(this.tokenVariableName));
    }

    public get currentUser(): UserInfo {
        if (this._currentUser == null) {
            this._currentUser = JSON.parse(this.localStorageVaiable.getItem(this.currentUserVariableName));
            // this._currentUser.userTypeEnum = this._currentUser.userType.id;
        }
        return this._currentUser;
    }

    public get persistentLogin(): any {
        if (this._persistentLogin == null) {
            this._persistentLogin = JSON.parse(this.localStorageVaiable.getItem(this.persistentLoginVariableName));
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

        this.localStorageVaiable.setItem(this.tokenVariableName, JSON.stringify(responseData.token));
        this.localStorageVaiable.setItem(this.currentUserVariableName, JSON.stringify(responseData.user));
        if (responseData.rememberMe != null)
        this.localStorageVaiable.setItem(this.persistentLoginVariableName, JSON.stringify(responseData.rememberMe));
    }

    updateCurrentUserInfo(user) {
        this._currentUser = null;
        this.localStorageVaiable.setItem(this.currentUserVariableName, JSON.stringify(user));
    }

    public destroyLoginInfo() {
        this._currentUser = null;
        this._persistentLogin = null;

        this.localStorageVaiable.removeItem(this.tokenVariableName);
        this.localStorageVaiable.removeItem(this.currentUserVariableName);
        this.localStorageVaiable.removeItem(this.persistentLoginVariableName);
        this.logoutSource$.next();
    }

    hasPermission(permission: Permission): boolean{
        return this._currentUser != null && this._currentUser.permissions.indexOf(permission) != -1;
    }
}