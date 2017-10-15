import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import { Observable, ObservableInput } from 'rxjs/observable';
import { ExceptionHandlingService } from './exception-handling.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class HttpExtensionService {

    constructor(private http: Http, private environmentService: EnvironmentService/*, private handleExceptionService: ExceptionHandlingService*/) { }

    createAuthorizationHeader(headers: Headers) {
        headers.append('Authorization', this.environmentService.token);
    }

    get(url): Observable<any> {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.get(url, { headers: headers })
            // .catch((error: any) => this.handleExceptionService.handleError(error));
    }

    post(url, data?, options?): Observable<any> {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        if (options == null)
            options = {};
        options.headers = headers;
        return this.http.post(url, data, options)
            // .catch((err: any) => this.handleExceptionService.handleError(err));
    }

    delete(url, data?, options?): Observable<any> {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        if (options == null)
            options = {};
        options.headers = headers;
        return this.http.delete(url, options)
            // .catch((err: any) => this.handleExceptionService.handleError(err));
    }

}
