import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';

@Injectable()
export class LookupsService {

  protected basePath = environment.apiUrl + 'lookups/';

  constructor(private http: Http, private httpExtension: HttpExtensionService) { }

  getAllAppointmentTypes(): Observable<any> {
    return this.http.get(this.basePath + 'getAllAppointmentTypes')
      .map((response: Response) => response.json());
  }

  addEditAppointmentType(appointmentType): Observable<any> {
    return this.httpExtension.post(this.basePath + 'addEditAppointmentType', appointmentType)
      .map((response: Response) => response.json());

  }

}
