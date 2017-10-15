import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { EnvironmentService } from '../../services/environment.service';
import { NotificationService } from "../../services/notification.service";
import { HttpExtensionService } from "../../services/http-extension.service";

@Injectable()
export class UserManagementService {
  protected basePath = environment.apiUrl + 'users/';

  constructor(private http: Http, private environmentService: EnvironmentService, private notificationService: NotificationService,
    private httpExtensionService: HttpExtensionService) {
  }

  login(email: string, password: string, rememberMe: boolean): Observable<any> {
    let body = {
      user: {
        email: email,
        password: password
      },
      rememberMe: rememberMe
    }

    return this.http.post(this.basePath + 'login', body)
      .map((response: Response) => {
        if (response.status == 401)
          return false;
        let resData = response.json();
        if (resData == null || resData.token == null || resData.user == null)
          return false;
        this.environmentService.currentUser = null;
        this.environmentService.setUserLoginInfo(resData);
        return true;
      })
      .catch((error: any) => this.handleError(error));
  }

  persistentLogin(): Observable<any> {
    return this.http.post(this.basePath + 'persistentLogin', this.environmentService.persistentLogin)
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

  register(user): Observable<boolean> {
    return this.http.post(this.basePath + 'register', user)
      .map((response: Response) => response.json());
  }

  checkEmailExistence(email: string): Observable<boolean> {
    return this.http.get(this.basePath + 'checkEmailExistence?email=' + email)
      .map((response: Response) => response.json());
  }

  activateMail(token): Observable<any> {
    return this.http.get(this.basePath + 'activateMail?token=' + token)
      .map((response: Response) => response.json());
    // .catch((error: Error) => console.log(error))
  }

  // todo: change http with http client 
  getAllSystemUsers() {
    return this.httpExtensionService.get(this.basePath + 'getAllSystemUsers')
      .map((response: Response) => response.json());
  }

  deleteUserById(id) {
    return this.httpExtensionService.delete(this.basePath + 'deleteUserById?id=' + id)
      .map((response: Response) => response.json());
  }

  completeUserRegistration(userWithToken){
    return this.http.post(this.basePath + 'completeUserRegistration', userWithToken)
    .map((response: Response) => response.json())
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
    }
    if (error != null && error.status == 500) {
      let errorBody = error.json();
      errorObj.message = errorBody.message;
      errorObj.invalidProperties = errorBody.invalidProperties;
      if (errorBody.code == 400) { // for bad request, handled exception
        this.notificationService.printErrorMessage(errorBody.message)
      }
      else if (errorBody.code == 500) { // unhandled exception
        if (environment.production)
          this.notificationService.printErrorMessage('حدث خطأ غير متوقع, برجاء المحاولة في وقت لاحق');
        else
          this.notificationService.printErrorMessage(errorBody.message);
      }
    }

    return Observable.throw(errorObj);
  }
}
