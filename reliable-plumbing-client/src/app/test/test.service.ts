import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { EnvironmentService, AlertifyService, ExceptionHandlingService } from '../services/services.exports';

@Injectable()
export class TestService {
    protected basePath = environment.apiUrl + 'users/';

    constructor(private http: Http, private environmentService: EnvironmentService, private alertifyService: AlertifyService, 
        private handleExceptionService: ExceptionHandlingService) {
    }

    createAuthorizationHeader(headers: Headers) {
        headers.append('Authorization', this.environmentService.serializedToken.token);
    }

    validateToken(): Observable<any> {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.get(this.basePath + 'validateToken', { headers: headers })
            .map((response: Response) => response.json())
            .catch((error: any) => this.handleExceptionService.handleError(error));
    }
}
