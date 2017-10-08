import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { EnvironmentService } from '../../services/environment.service';

@Injectable()
export class UserManagementService {
  protected basePath = environment.apiUrl + 'users';

  constructor(private http: Http, private environmentService: EnvironmentService) {
  }

  login(username: string, password: string): Observable<boolean> {

    // let body = new URLSearchParams();
    // body.set('username', username);
    // body.set('password', password);
    let body = {
      username: username,
      password: password
    }

    return this.http.post(this.basePath + '/login', body)
      .map((response: Response) => {
        if (response.status == 401)
          return false;
        let resData = response.json();
        if (resData == null || resData.token == null || resData.currentUser == null)
          return false;
        this.environmentService.currentUser = null;
        this.environmentService.setUserLoginInfo(resData);
        return true;
      });

  }

  register(user): Observable<boolean> {
    return this.http.post(this.basePath + '/register', user)
      .map((response: Response) => {

        return true;
      })
  }
}
