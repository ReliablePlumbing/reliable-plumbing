import { Injectable, Injector } from '@angular/core'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Router } from '@angular/router';
import { EnvironmentService } from './environment.service';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ExceptionHandlingService {
    constructor(private injector: Injector, private environmentService: EnvironmentService,
        private notificationService: NotificationService) {
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
        if (error != null && error.status == 401) {
            errorObj.message = 'unauthorized for this method';
            this.environmentService.destroyLoginInfo();
            if (this.router.url.indexOf('/') > 0)
                return;
            this.router.navigate(['/']);//, { queryParams: { returnUrl: this.router.url } });
        }
        if (error != null && error.status == 500) {
            let errorBody = error.json();
            errorObj.message = errorBody.message;
            errorObj.invalidProperties =  errorBody.invalidProperties;
            if (errorBody.code == 400) { // for bad request, handled exception
                this.notificationService.printErrorMessage(errorBody.message)
            }
            else if(errorBody.code == 500){ // unhandled exception
                if(environment.production)
                    this.notificationService.printErrorMessage('حدث خطأ غير متوقع, برجاء المحاولة في وقت لاحق');
                else
                    this.notificationService.printErrorMessage(errorBody.message);
            }
        }
       
        return Observable.throw(errorObj);
    }

}