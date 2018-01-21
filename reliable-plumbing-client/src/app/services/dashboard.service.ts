import { Injectable } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';

@Injectable()
export class DashboardService {

  protected basePath = environment.apiUrl + 'dashboards/';

  constructor(private httpService: HttpExtensionService) { }

  getServicesStats(): Observable<any> {
    return this.httpService.get(this.basePath + 'getServicesStats')
      .map((response: Response) => response.json());
  }

}

