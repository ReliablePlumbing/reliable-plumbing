import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import { Observable, ObservableInput } from 'rxjs/observable';
import { ExceptionHandlingService } from './exception-handling.service';
import { EnvironmentService } from './environment.service';

@Injectable()
export class HttpExtensionService {

    constructor(private http: Http, private environmentService: EnvironmentService, private handleExceptionService: ExceptionHandlingService) { }

    private createAuthorizationHeader(headers: Headers) {
        headers.append('Authorization', this.environmentService.token);
    }

    private handleOptions(options?, createAuthHeader = true) {
        let headers = new Headers();

        if (createAuthHeader)
            this.createAuthorizationHeader(headers);

        if (options == null)
            options = {};

        if (options.headers != null)
            for (let headerKey in options.headers)
                headers.append(headerKey, options.headers[headerKey]);

        options.headers = headers;

        return options;
    }

    get(url, withAuthorization = true): Observable<any> {
        let options = this.handleOptions(null, withAuthorization);

        return this.http.get(url, options)
            .catch((error: any) => this.handleExceptionService.handleError(error));
    }

    post(url, data?, withAuthorization = true, options?): Observable<any> {
        options = this.handleOptions(options, withAuthorization);

        return this.http.post(url, data, options)
            .catch((err: any) => this.handleExceptionService.handleError(err));
    }

    delete(url, data?, withAuthorization = true, options?): Observable<any> {
        options = this.handleOptions(options, withAuthorization);

        return this.http.delete(url, options)
            .catch((err: any) => this.handleExceptionService.handleError(err));
    }

}
