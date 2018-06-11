import { Injectable, Injector } from '@angular/core'
import { Response, Http } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Router, ActivatedRoute } from '@angular/router';
import { EnvironmentService } from './environment.service';
import { AlertifyService } from './alertify.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ExceptionHandlingService {

    constructor(private injector: Injector, private environmentService: EnvironmentService, private http: Http,
        private alertifyService: AlertifyService, private activatedRoute: ActivatedRoute) {
    }

    public get router(): Router {
        return this.injector.get(Router);
    }

    handleError(error: Response | any) {
        // for unauthorized
        let errorObj = {
            invalidProperties: null,
            message: ''
        };
        if (error != null && error.status == 401 || error.status == 403) {
            let persistentLogin = this.environmentService.persistentLogin;
            if (persistentLogin == null || persistentLogin == undefined || persistentLogin.selector == null || persistentLogin.selector == undefined)
                this.unauthorize(errorObj);
            else
                this.persistentLogin().subscribe(result => {
                    if (!result) {
                        this.unauthorize(errorObj);
                    }
                });
        }
        if (error != null && error.status == 500) {
            let errorBody = error.json();
            errorObj.message = errorBody.message;
            errorObj.invalidProperties = errorBody.invalidProperties;
            if (errorBody.code == 400) { // for bad request, handled exception
                this.alertifyService.error(errorBody.message)
            }
            else if (errorBody.code == 500) { // unhandled exception
                if (environment.production)
                    this.alertifyService.error('');
                else
                    this.alertifyService.error(errorBody.message);
            }
        }
        return Observable.throw(errorObj);
    }
    unauthorize(errorObj): any {
        errorObj.message = 'unauthorized for this method';
        this.environmentService.destroyLoginInfo();
        if (this.router.url.indexOf('/') > 0)
            return;
        let returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
        if (!returnUrl)
            returnUrl = this.router.url;
            
        this.router.navigate(['/'], { queryParams: { returnUrl: returnUrl } });
    }

    persistentLogin(): Observable<any> {
        return this.http.post(environment.apiUrl + 'users/persistentLogin', this.environmentService.persistentLogin)
            .map((response: Response) => {
                if (response.status == 401)
                    return false;
                let resData = response.json();
                if (resData == null || resData.token == null || resData.user == null)
                    return false;
                this.environmentService.setUserLoginInfo(resData);
                return true;
            })
            .catch((error: any) => this.handleError(error));
    }

}